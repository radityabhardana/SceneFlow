import "server-only";

import { getAiGatewayConfig, getConfiguredModelHint } from "./config";
import { AiGatewayError } from "./errors";
import type {
  AiEnvironment,
  AiGatewayCheckResult,
  AiGatewayConfig,
  AiGatewayDependencies,
  AiGenerationOptions,
  AiGenerationResult,
  AiMessage,
} from "./types";

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function safeError(code: AiGatewayError["code"], message: string): AiGatewayError {
  return new AiGatewayError(code, message);
}

function timeoutSignal(timeoutMs: number): { signal: AbortSignal; cancel: () => void } {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return { signal: controller.signal, cancel: () => clearTimeout(timer) };
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

function normalizeMessages(messages: AiMessage[]): AiMessage[] {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw safeError("AI_REQUEST_FAILED", "At least one AI message is required.");
  }
  return messages.map((message) => {
    if (!isRecord(message) || !["system", "user", "assistant"].includes(String(message.role))) {
      throw safeError("AI_REQUEST_FAILED", "Each AI message must have a valid role.");
    }
    if (typeof message.content !== "string" || message.content.trim().length === 0) {
      throw safeError("AI_REQUEST_FAILED", "Each AI message must have non-empty content.");
    }
    return { role: message.role as AiMessage["role"], content: message.content };
  });
}

function normalizeOptions(options: AiGenerationOptions | undefined): AiGenerationOptions {
  if (options === undefined) return {};
  if (!isRecord(options)) {
    throw safeError("AI_REQUEST_FAILED", "AI generation options must be an object.");
  }
  if (options.temperature !== undefined && (typeof options.temperature !== "number" || !Number.isFinite(options.temperature) || options.temperature < 0)) {
    throw safeError("AI_REQUEST_FAILED", "temperature must be a finite non-negative number.");
  }
  if (options.maxTokens !== undefined && (typeof options.maxTokens !== "number" || !Number.isSafeInteger(options.maxTokens) || options.maxTokens <= 0)) {
    throw safeError("AI_REQUEST_FAILED", "maxTokens must be a positive integer.");
  }
  return {
    ...(options.temperature === undefined ? {} : { temperature: options.temperature }),
    ...(options.maxTokens === undefined ? {} : { maxTokens: options.maxTokens }),
  };
}

function requestHeaders(config: AiGatewayConfig): Record<string, string> {
  return {
    "content-type": "application/json",
    ...(config.apiKey ? { authorization: `Bearer ${config.apiKey}` } : {}),
  };
}

function readErrorCode(error: unknown): AiGatewayError["code"] {
  return error instanceof AiGatewayError ? error.code : "AI_REQUEST_FAILED";
}

async function responseJson(response: Response, code: AiGatewayError["code"]): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    throw safeError(code, "The AI gateway returned an invalid JSON response.");
  }
}

async function generateTextWith(
  messages: AiMessage[],
  options: AiGenerationOptions | undefined,
  env: AiEnvironment,
  fetcher: typeof fetch,
): Promise<AiGenerationResult> {
  const config = getAiGatewayConfig(env);
  const normalizedMessages = normalizeMessages(messages);
  const normalizedOptions = normalizeOptions(options);
  const timeout = timeoutSignal(config.timeoutMs);

  try {
    const response = await fetcher(`${config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: requestHeaders(config),
      body: JSON.stringify({
        model: config.model,
        messages: normalizedMessages,
        stream: false,
        ...(normalizedOptions.temperature === undefined ? {} : { temperature: normalizedOptions.temperature }),
        ...(normalizedOptions.maxTokens === undefined ? {} : { max_tokens: normalizedOptions.maxTokens }),
      }),
      cache: "no-store",
      redirect: "error",
      signal: timeout.signal,
    });

    if (!response.ok) {
      throw safeError("AI_REQUEST_FAILED", "The AI gateway rejected the generation request.");
    }
    const payload = await responseJson(response, "AI_INVALID_RESPONSE");
    if (!isRecord(payload) || !Array.isArray(payload.choices)) {
      throw safeError("AI_INVALID_RESPONSE", "The AI gateway returned an invalid generation response.");
    }
    const firstChoice = payload.choices[0];
    const message = isRecord(firstChoice) ? firstChoice.message : undefined;
    const text = isRecord(message) ? message.content : undefined;
    if (typeof text !== "string" || text.trim().length === 0) {
      throw safeError("AI_INVALID_RESPONSE", "The AI gateway returned no usable generated text.");
    }
    return { text, model: config.model };
  } catch (error) {
    if (error instanceof AiGatewayError) throw error;
    if (timeout.signal.aborted || isAbortError(error)) {
      throw safeError("AI_REQUEST_TIMEOUT", "The AI gateway generation request timed out.");
    }
    throw safeError("AI_REQUEST_FAILED", "The AI gateway generation request failed.");
  } finally {
    timeout.cancel();
  }
}

async function checkAiGatewayWith(env: AiEnvironment, fetcher: typeof fetch): Promise<AiGatewayCheckResult> {
  const configuredModel = getConfiguredModelHint(env);
  let config: AiGatewayConfig;
  try {
    config = getAiGatewayConfig(env);
  } catch (error) {
    const code = readErrorCode(error);
    return {
      reachable: false,
      configuredModel,
      modelAvailable: false,
      error: { code, message: error instanceof Error ? error.message : "AI gateway configuration is invalid." },
    };
  }

  const timeout = timeoutSignal(config.timeoutMs);
  try {
    const response = await fetcher(`${config.baseUrl}/models`, {
      method: "GET",
      cache: "no-store",
      redirect: "error",
      signal: timeout.signal,
      headers: config.apiKey ? { authorization: `Bearer ${config.apiKey}` } : undefined,
    });
    if (!response.ok) {
      return {
        reachable: false,
        configuredModel: config.model,
        modelAvailable: false,
        error: { code: "AI_GATEWAY_UNREACHABLE", message: "The AI gateway models endpoint could not be reached." },
      };
    }

    const payload = await responseJson(response, "AI_INVALID_RESPONSE");
    if (!isRecord(payload) || !Array.isArray(payload.data) || payload.data.some((item) => !isRecord(item) || typeof item.id !== "string" || item.id.trim().length === 0)) {
      return {
        reachable: true,
        configuredModel: config.model,
        modelAvailable: false,
        error: { code: "AI_INVALID_RESPONSE", message: "The AI gateway returned an invalid models response." },
      };
    }
    const modelIds = payload.data.map((item) => String((item as JsonRecord).id));
    if (!modelIds.includes(config.model)) {
      return {
        reachable: true,
        configuredModel: config.model,
        modelAvailable: false,
        modelIds,
        error: { code: "AI_MODEL_NOT_AVAILABLE", message: `Configured model \"${config.model}\" is not available.` },
      };
    }
    return { reachable: true, configuredModel: config.model, modelAvailable: true, modelIds };
  } catch (error) {
    if (timeout.signal.aborted || isAbortError(error)) {
      return {
        reachable: false,
        configuredModel: config.model,
        modelAvailable: false,
        error: { code: "AI_REQUEST_TIMEOUT", message: "The AI gateway models endpoint timed out." },
      };
    }
    const code = readErrorCode(error);
    return {
      reachable: false,
      configuredModel: config.model,
      modelAvailable: false,
      error: {
        code: code === "AI_INVALID_RESPONSE" ? code : "AI_GATEWAY_UNREACHABLE",
        message: code === "AI_INVALID_RESPONSE" ? "The AI gateway returned an invalid models response." : "The AI gateway models endpoint failed.",
      },
    };
  } finally {
    timeout.cancel();
  }
}

export function createAiGatewayClient(dependencies: AiGatewayDependencies = {}) {
  const env = dependencies.env ?? process.env;
  const fetcher = dependencies.fetch ?? fetch;
  return {
    getAiGatewayConfig: () => getAiGatewayConfig(env),
    generateText: (messages: AiMessage[], options?: AiGenerationOptions) => generateTextWith(messages, options, env, fetcher),
    checkAiGateway: () => checkAiGatewayWith(env, fetcher),
  };
}

export async function generateText(messages: AiMessage[], options?: AiGenerationOptions): Promise<AiGenerationResult> {
  return createAiGatewayClient().generateText(messages, options);
}

export async function checkAiGateway(): Promise<AiGatewayCheckResult> {
  return createAiGatewayClient().checkAiGateway();
}
