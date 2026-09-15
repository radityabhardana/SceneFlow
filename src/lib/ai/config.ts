import "server-only";

import { AiGatewayError } from "./errors";
import type { AiEnvironment, AiGatewayConfig } from "./types";

const DEFAULT_BASE_URL = "http://localhost:20128/v1";
const DEFAULT_TIMEOUT_MS = 120_000;

function configurationError(message: string): AiGatewayError {
  return new AiGatewayError("AI_GATEWAY_CONFIGURATION_ERROR", message);
}

function isLoopbackHostname(hostname: string): boolean {
  const normalized = hostname.replace(/^\[|\]$/g, "").toLowerCase();
  return normalized === "localhost" || normalized === "127.0.0.1" || normalized === "::1";
}

function normalizeBaseUrl(value: string): string {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw configurationError("AI_GATEWAY_BASE_URL must be a valid absolute HTTP(S) URL.");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw configurationError("AI_GATEWAY_BASE_URL must use HTTP or HTTPS.");
  }
  if (parsed.username || parsed.password) {
    throw configurationError("AI_GATEWAY_BASE_URL must not contain credentials.");
  }
  if (parsed.search || parsed.hash) {
    throw configurationError("AI_GATEWAY_BASE_URL must not contain a query string or hash.");
  }

  const pathname = parsed.pathname.replace(/\/+$/, "") || "/";
  if (pathname !== "/" && pathname !== "/v1") {
    throw configurationError("AI_GATEWAY_BASE_URL may only target the root path or /v1.");
  }
  if (parsed.protocol === "http:" && !isLoopbackHostname(parsed.hostname)) {
    throw configurationError("Remote AI_GATEWAY_BASE_URL values must use HTTPS.");
  }

  return `${parsed.origin}/v1`;
}

function parseTimeout(value: string): number {
  if (!/^\d+$/.test(value)) {
    throw configurationError("AI_GATEWAY_TIMEOUT_MS must be a positive integer in milliseconds.");
  }
  const timeoutMs = Number(value);
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs <= 0) {
    throw configurationError("AI_GATEWAY_TIMEOUT_MS must be a positive integer in milliseconds.");
  }
  return timeoutMs;
}

export function getAiGatewayConfig(env: AiEnvironment = process.env): AiGatewayConfig {
  const rawBaseUrl = env.AI_GATEWAY_BASE_URL;
  const rawModel = env.AI_GATEWAY_MODEL;
  const rawTimeout = env.AI_GATEWAY_TIMEOUT_MS;

  if (rawBaseUrl !== undefined && rawBaseUrl.trim().length === 0) {
    throw configurationError("AI_GATEWAY_BASE_URL must not be empty.");
  }
  if (rawModel === undefined || rawModel.trim().length === 0) {
    throw configurationError("AI_GATEWAY_MODEL is required and must not be empty.");
  }
  if (rawTimeout !== undefined && rawTimeout.trim().length === 0) {
    throw configurationError("AI_GATEWAY_TIMEOUT_MS must not be empty.");
  }

  const baseUrl = normalizeBaseUrl((rawBaseUrl ?? DEFAULT_BASE_URL).trim());
  const model = rawModel.trim();
  const timeoutMs = parseTimeout((rawTimeout ?? String(DEFAULT_TIMEOUT_MS)).trim());
  const apiKey = env.AI_GATEWAY_API_KEY?.trim() || undefined;

  return { baseUrl, model, ...(apiKey ? { apiKey } : {}), timeoutMs };
}

export function getConfiguredModelHint(env: AiEnvironment = process.env): string {
  return env.AI_GATEWAY_MODEL?.trim() || "";
}
