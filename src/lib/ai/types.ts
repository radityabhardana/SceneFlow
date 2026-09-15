export type AiMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type AiGenerationOptions = {
  temperature?: number;
  maxTokens?: number;
};

export type AiGenerationResult = {
  text: string;
  model: string;
};

export const AI_GATEWAY_ERROR_CODES = [
  "AI_GATEWAY_CONFIGURATION_ERROR",
  "AI_GATEWAY_UNREACHABLE",
  "AI_MODEL_NOT_AVAILABLE",
  "AI_REQUEST_TIMEOUT",
  "AI_REQUEST_FAILED",
  "AI_INVALID_RESPONSE",
] as const;

export type AiGatewayErrorCode = (typeof AI_GATEWAY_ERROR_CODES)[number];

export type AiGatewayConfig = {
  baseUrl: string;
  model: string;
  apiKey?: string;
  timeoutMs: number;
};

export type AiGatewaySafeError = {
  code: AiGatewayErrorCode;
  message: string;
};

export type AiGatewayCheckResult = {
  reachable: boolean;
  configuredModel: string;
  modelAvailable: boolean;
  modelIds?: string[];
  error?: AiGatewaySafeError;
};

export type AiEnvironment = Readonly<Record<string, string | undefined>>;

export type AiGatewayDependencies = {
  env?: AiEnvironment;
  fetch?: typeof fetch;
};
