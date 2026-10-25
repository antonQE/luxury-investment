export const ERROR_CODES = {
  VALIDATION_FAILED: { status: 400, message: 'The request is invalid.' },
  UNAUTHENTICATED: { status: 401, message: 'Authentication is required.' },
  FORBIDDEN: { status: 403, message: 'You do not have permission for this action.' },
  NOT_FOUND: { status: 404, message: 'The resource was not found.' },
  CONFLICT: { status: 409, message: 'The request conflicts with the current state.' },
  RATE_LIMITED: { status: 429, message: 'Too many requests.' },
  INTERNAL: { status: 500, message: 'Something went wrong.' },
} as const;

export type ErrorCode = keyof typeof ERROR_CODES;

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly details: unknown;

  constructor(code: ErrorCode, message?: string, details?: unknown) {
    super(message ?? ERROR_CODES[code].message);
    this.name = 'AppError';
    this.code = code;
    this.status = ERROR_CODES[code].status;
    this.details = details;
  }
}
