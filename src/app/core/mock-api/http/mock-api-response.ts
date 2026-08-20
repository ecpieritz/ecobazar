import { HttpErrorResponse, HttpHeaders, HttpRequest, HttpResponse } from '@angular/common/http';

import type { ApiErrorResponse } from '@core/api';

export type MockApiResult = HttpResponse<unknown> | HttpErrorResponse;

export const mockJsonResponse = <T>(
  request: HttpRequest<unknown>,
  body: T,
  status = 200,
): HttpResponse<T> =>
  new HttpResponse({
    body: structuredClone(body),
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    status,
    url: request.urlWithParams,
  });

export const mockErrorResponse = (
  request: HttpRequest<unknown>,
  status: number,
  code: string,
  message: string,
): HttpErrorResponse => {
  const statusText =
    {
      400: 'Bad Request',
      401: 'Unauthorized',
      409: 'Conflict',
      422: 'Unprocessable Entity',
      404: 'Not Found',
      405: 'Method Not Allowed',
    }[status] ?? 'Mock API Error';

  const error: ApiErrorResponse = {
    error: { code, message },
  };

  return new HttpErrorResponse({
    error,
    status,
    statusText,
    url: request.urlWithParams,
  });
};
