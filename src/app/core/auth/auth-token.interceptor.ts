import { type HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { environment } from '@environments/environment';

import { AuthSessionStorage } from './auth-session.storage';

export const authTokenInterceptor: HttpInterceptorFn = (request, next) => {
  const token = inject(AuthSessionStorage).accessToken();
  const apiRequest = request.url.startsWith(environment.apiBaseUrl);

  return next(
    token && apiRequest
      ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : request,
  );
};
