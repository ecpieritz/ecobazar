import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { NotificationStore } from '@core/notifications';

@Component({
  selector: 'app-notification-outlet',
  templateUrl: './notification-outlet.html',
  styleUrl: './notification-outlet.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationOutlet {
  protected readonly store = inject(NotificationStore);
}
