import { ErrorHandler, inject, Injectable } from '@angular/core';

import { NotificationStore } from './notification.store';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly notifications = inject(NotificationStore);

  handleError(error: unknown): void {
    this.notifications.error(
      'An unexpected application error occurred. You can safely retry the action.',
      'Unexpected error',
    );
    console.error(error);
  }
}
