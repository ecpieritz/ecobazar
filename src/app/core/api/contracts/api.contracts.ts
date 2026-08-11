export interface ApiResponse<T> {
  readonly data: T;
}

export interface PaginationQuery {
  readonly page?: number;
  readonly pageSize?: number;
}

export interface PaginationMeta {
  readonly page: number;
  readonly pageSize: number;
  readonly totalItems: number;
  readonly totalPages: number;
}

export interface PaginatedApiResponse<T> {
  readonly data: readonly T[];
  readonly pagination: PaginationMeta;
}

export interface ApiFieldError {
  readonly field: string;
  readonly message: string;
}

export interface ApiError {
  readonly code: string;
  readonly message: string;
  readonly fieldErrors?: readonly ApiFieldError[];
}

export interface ApiErrorResponse {
  readonly error: ApiError;
}
