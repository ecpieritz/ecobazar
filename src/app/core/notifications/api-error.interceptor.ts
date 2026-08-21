import { HttpErrorResponse, type HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { NotificationStore } from './notification.store';

export const apiErrorInterceptor: HttpInterceptorFn = (request, next) => {
  const notifications = inject(NotificationStore);
  return next(request).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && (error.status === 0 || error.status >= 500)) {
        notifications.error(
          error.status === 0
            ? 'The mock service is unavailable. Check your connection and try again.'
            : 'The mock service could not complete the request. Please try again.',
          'Request failed',
        );
      }
      return throwError(() => error);
    }),
  );
};
