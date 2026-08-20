import {
  HttpErrorResponse,
  type HttpEvent,
  type HttpHandlerFn,
  type HttpInterceptorFn,
  type HttpRequest,
} from '@angular/common/http';
import { mergeMap, Observable, of, throwError, timer } from 'rxjs';

import { environment } from '@environments/environment';

import { handleCatalogRequest } from '../handlers/catalog.mock-handler';
import { handleAccountRequest } from '../handlers/account.mock-handler';
import { mockErrorResponse, type MockApiResult } from './mock-api-response';

const MOCK_ORIGIN = 'http://mock-api.local';

const normalizedPath = (path: string): string => {
  const withLeadingSlash = path.startsWith('/') ? path : `/${path}`;
  return withLeadingSlash.length > 1 ? withLeadingSlash.replace(/\/$/, '') : withLeadingSlash;
};

const delayedResult = (result: MockApiResult): Observable<HttpEvent<unknown>> =>
  timer(environment.mockApi.delayMs).pipe(
    mergeMap(() => (result instanceof HttpErrorResponse ? throwError(() => result) : of(result))),
  );

const handleMockRequest = (
  request: HttpRequest<unknown>,
  url: URL,
  apiPath: string,
): MockApiResult =>
  handleAccountRequest(request, url, apiPath) ??
  handleCatalogRequest(request, url, apiPath) ??
  mockErrorResponse(
    request,
    404,
    'ROUTE_NOT_FOUND',
    `No mock route handles ${request.method} ${apiPath}.`,
  );

const shouldIntercept = (requestPath: string, apiBasePath: string): boolean =>
  requestPath === apiBasePath || requestPath.startsWith(`${apiBasePath}/`);

export const mockApiInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  if (!environment.mockApi.enabled) {
    return next(request);
  }

  const requestUrl = new URL(request.urlWithParams, MOCK_ORIGIN);
  const apiBasePath = normalizedPath(new URL(environment.apiBaseUrl, MOCK_ORIGIN).pathname);

  if (!shouldIntercept(requestUrl.pathname, apiBasePath)) {
    return next(request);
  }

  const apiPath = requestUrl.pathname.slice(apiBasePath.length) || '/';
  return delayedResult(handleMockRequest(request, requestUrl, apiPath));
};
