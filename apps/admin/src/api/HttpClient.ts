import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from 'axios';

import { ApiError, type ApiErrorBody, type ApiResponse } from '@/types/api';

/**
 * Thin axios wrapper. Auth (Bearer + refresh on 401) is added in EPIC-02.
 * Ported from Fantasy_Web_Admin without token handling.
 */
export default class HttpClient {
  readonly #client: AxiosInstance;

  constructor(baseURL: string) {
    this.#client = axios.create({
      baseURL,
      withCredentials: true,
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    });
    this.#setupInterceptors();
  }

  #setupInterceptors(): void {
    this.#client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError<ApiErrorBody>) => {
        const message = error.response?.data.error?.message ?? (error.message || 'Request failed');
        return Promise.reject(
          new ApiError(
            message,
            error.response?.status ?? 500,
            error.response?.data,
            error.config?.url,
            error.config?.method?.toUpperCase(),
          ),
        );
      },
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.#client.get<T>(url, config);
    return { data: response.data, status: response.status };
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.#client.post<T>(url, data, config);
    return { data: response.data, status: response.status };
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.#client.put<T>(url, data, config);
    return { data: response.data, status: response.status };
  }

  async patch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    const response = await this.#client.patch<T>(url, data, config);
    return { data: response.data, status: response.status };
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.#client.delete<T>(url, config);
    return { data: response.data, status: response.status };
  }
}
