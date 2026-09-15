import { describe, expect, it, vi } from "vitest";

import { createAiGatewayClient } from "@/lib/ai";
import { getAiGatewayConfig } from "@/lib/ai/server";
import type { AiEnvironment } from "@/lib/ai";

const secret = "test-secret-never-returned";

function environment(overrides: Partial<Record<keyof AiEnvironment, string | undefined>> = {}): AiEnvironment {
  return {
    AI_GATEWAY_BASE_URL: "http://localhost:20128",
    AI_GATEWAY_MODEL: "gpt-5.6-luna",
    AI_GATEWAY_API_KEY: undefined,
    AI_GATEWAY_TIMEOUT_MS: "120000",
    ...overrides,
  };
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("AI gateway configuration", () => {
  it("requires an explicitly configured model and normalizes root or /v1 URLs", () => {
    expect(() => getAiGatewayConfig({})).toThrowError(expect.objectContaining({ code: "AI_GATEWAY_CONFIGURATION_ERROR" }));
    expect(getAiGatewayConfig(environment({ AI_GATEWAY_BASE_URL: "http://localhost:20128/v1/" })).model).toBe("gpt-5.6-luna");
    expect(getAiGatewayConfig(environment({ AI_GATEWAY_BASE_URL: "http://localhost:20128/v1/" })).baseUrl).toBe("http://localhost:20128/v1");
  });

  it.each([
    ["invalid protocol", { AI_GATEWAY_BASE_URL: "ftp://localhost:20128" }],
    ["remote HTTP", { AI_GATEWAY_BASE_URL: "http://gateway.example.test/v1" }],
    ["credentials", { AI_GATEWAY_BASE_URL: "https://user:pass@gateway.example.test/v1" }],
    ["query", { AI_GATEWAY_BASE_URL: "https://gateway.example.test/v1?unsafe=1" }],
    ["arbitrary path", { AI_GATEWAY_BASE_URL: "https://gateway.example.test/custom" }],
    ["invalid timeout", { AI_GATEWAY_TIMEOUT_MS: "not-a-number" }],
    ["missing model", { AI_GATEWAY_MODEL: undefined }],
    ["empty model", { AI_GATEWAY_MODEL: "   " }],
  ])("rejects %s with a configuration error", (_label, overrides) => {
    expect(() => getAiGatewayConfig(environment(overrides))).toThrowError(expect.objectContaining({ code: "AI_GATEWAY_CONFIGURATION_ERROR" }));
  });
});

describe("generateText", () => {
  it("sends the exact configured model, stream false, and only optional authorization", async () => {
    const calls: RequestInit[] = [];
    const fetcher = vi.fn<typeof fetch>(async (_input, init) => {
      calls.push(init ?? {});
      return jsonResponse({ choices: [{ message: { content: "  generated text  " } }] });
    });
    const client = createAiGatewayClient({ env: environment(), fetch: fetcher });

    const result = await client.generateText([{ role: "user", content: "hello" }], { temperature: 0.2, maxTokens: 20 });
    const body = JSON.parse(String(calls[0]?.body)) as Record<string, unknown>;
    const headers = new Headers(calls[0]?.headers);

    expect(result).toEqual({ text: "  generated text  ", model: "gpt-5.6-luna" });
    expect(body).toMatchObject({ model: "gpt-5.6-luna", stream: false, temperature: 0.2, max_tokens: 20 });
    expect(headers.has("authorization")).toBe(false);
    expect(calls[0]?.cache).toBe("no-store");
    expect(calls[0]?.redirect).toBe("error");
  });

  it("adds a non-empty API key only to the authorization header and never to public results", async () => {
    const fetcher = vi.fn<typeof fetch>(async (_input, init) => {
      expect(new Headers(init?.headers).get("authorization")).toBe(`Bearer ${secret}`);
      return jsonResponse({ choices: [{ message: { content: "safe" } }] });
    });
    const result = await createAiGatewayClient({ env: environment({ AI_GATEWAY_API_KEY: `  ${secret}  ` }), fetch: fetcher }).generateText([
      { role: "user", content: "hello" },
    ]);

    expect(JSON.stringify(result)).not.toContain(secret);
  });

  it("normalizes malformed input and malformed chat responses to safe errors", async () => {
    const client = createAiGatewayClient({ env: environment(), fetch: vi.fn<typeof fetch>(async () => jsonResponse({ choices: [] })) });

    await expect(client.generateText([])).rejects.toMatchObject({ code: "AI_REQUEST_FAILED" });
    await expect(client.generateText([{ role: "user", content: "hello" }])).rejects.toMatchObject({ code: "AI_INVALID_RESPONSE" });
  });

  it("normalizes timeout, network, and HTTP failures without exposing the response body", async () => {
    const timeoutFetcher = vi.fn<typeof fetch>((_input, init) => new Promise<Response>((_resolve, reject) => {
      init?.signal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")), { once: true });
    }));
    await expect(createAiGatewayClient({ env: environment({ AI_GATEWAY_TIMEOUT_MS: "1" }), fetch: timeoutFetcher }).generateText([
      { role: "user", content: "hello" },
    ])).rejects.toMatchObject({ code: "AI_REQUEST_TIMEOUT" });

    const networkFetcher = vi.fn<typeof fetch>(async () => {
      throw new Error("network internals should not escape");
    });
    await expect(createAiGatewayClient({ env: environment(), fetch: networkFetcher }).generateText([{ role: "user", content: "hello" }])).rejects.toMatchObject({
      code: "AI_REQUEST_FAILED",
      message: "The AI gateway generation request failed.",
    });

    const body = "secret upstream body";
    const httpFetcher = vi.fn<typeof fetch>(async () => new Response(body, { status: 429 }));
    const error = await createAiGatewayClient({ env: environment(), fetch: httpFetcher }).generateText([{ role: "user", content: "hello" }]).catch((value: unknown) => value);
    expect(error).toMatchObject({ code: "AI_REQUEST_FAILED" });
    expect(JSON.stringify(error)).not.toContain(body);
  });
});

describe("checkAiGateway", () => {
  it("reports missing model configuration without selecting a fallback", async () => {
    const result = await createAiGatewayClient({
      env: environment({ AI_GATEWAY_MODEL: undefined }),
      fetch: vi.fn<typeof fetch>(),
    }).checkAiGateway();

    expect(result).toMatchObject({
      reachable: false,
      configuredModel: "",
      modelAvailable: false,
      error: { code: "AI_GATEWAY_CONFIGURATION_ERROR" },
    });
  });

  it("requires exact model availability and never selects an alternate model", async () => {
    const available = await createAiGatewayClient({
      env: environment(),
      fetch: vi.fn<typeof fetch>(async () => jsonResponse({ data: [{ id: "other-model" }, { id: "gpt-5.6-luna" }] })),
    }).checkAiGateway();
    expect(available).toMatchObject({ reachable: true, configuredModel: "gpt-5.6-luna", modelAvailable: true });

    const unavailable = await createAiGatewayClient({
      env: environment(),
      fetch: vi.fn<typeof fetch>(async () => jsonResponse({ data: [{ id: "other-model" }] })),
    }).checkAiGateway();
    expect(unavailable).toMatchObject({ reachable: true, modelAvailable: false, error: { code: "AI_MODEL_NOT_AVAILABLE" } });
    expect(JSON.stringify(unavailable)).not.toContain("other-model-secret");
  });

  it("handles malformed models responses and distinguishes timeout from unreachable errors", async () => {
    const malformed = await createAiGatewayClient({
      env: environment(),
      fetch: vi.fn<typeof fetch>(async () => jsonResponse({ data: [{ name: "missing-id" }] })),
    }).checkAiGateway();
    expect(malformed).toMatchObject({ reachable: true, modelAvailable: false, error: { code: "AI_INVALID_RESPONSE" } });

    const timeoutFetcher = vi.fn<typeof fetch>((_input, init) => new Promise<Response>((_resolve, reject) => {
      init?.signal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")), { once: true });
    }));
    const timedOut = await createAiGatewayClient({ env: environment({ AI_GATEWAY_TIMEOUT_MS: "1" }), fetch: timeoutFetcher }).checkAiGateway();
    expect(timedOut).toMatchObject({ reachable: false, modelAvailable: false, error: { code: "AI_REQUEST_TIMEOUT" } });
  });

  it("normalizes network and HTTP models failures safely", async () => {
    const network = await createAiGatewayClient({
      env: environment(),
      fetch: vi.fn<typeof fetch>(async () => {
        throw new Error("network internals");
      }),
    }).checkAiGateway();
    expect(network).toMatchObject({ reachable: false, error: { code: "AI_GATEWAY_UNREACHABLE" } });

    const http = await createAiGatewayClient({
      env: environment(),
      fetch: vi.fn<typeof fetch>(async () => new Response("private gateway body", { status: 401 })),
    }).checkAiGateway();
    expect(http).toMatchObject({ reachable: false, error: { code: "AI_GATEWAY_UNREACHABLE" } });
    expect(JSON.stringify(http)).not.toContain("private gateway body");
  });
});
