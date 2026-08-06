export type ErrorCode =
  | "INSUFFICIENT_BUDGET"
  | "SELF_RECOGNITION"
  | "DUPLICATE_REQUEST"
  | "INTERNAL";

export class ApiError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly retryable = false,
    public readonly requestId?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
