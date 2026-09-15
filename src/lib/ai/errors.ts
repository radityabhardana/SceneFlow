import type { AiGatewayErrorCode } from "./types";

export class AiGatewayError extends Error {
  readonly code: AiGatewayErrorCode;

  constructor(code: AiGatewayErrorCode, message: string) {
    super(message);
    this.name = "AiGatewayError";
    this.code = code;
  }
}
