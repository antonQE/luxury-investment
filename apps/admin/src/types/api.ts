export interface ApiResponse<T> {
  data: T;
  status: number;
}

export interface ApiErrorBody {
  error?: { code?: string; message?: string; details?: unknown };
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly response?: unknown;
  readonly url?: string;
  readonly method?: string;

  constructor(message: string, status: number, response?: unknown, url?: string, method?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.response = response;
    this.url = url;
    this.method = method;
    const body = response as ApiErrorBody | undefined;
    this.code = body?.error?.code ?? 'UNKNOWN';
  }

  isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }

  isServerError(): boolean {
    return this.status >= 500;
  }
}
