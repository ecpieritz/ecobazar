import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, map, of, startWith } from 'rxjs';

import { AuthStore } from '@core/auth';
import { OrderRepository } from '@core/data-access';
import type { Order } from '@core/domain';

interface DashboardOrders {
  status: 'loading' | 'success' | 'error';
  orders: readonly Order[];
}

@Component({
  selector: 'app-dashboard-page',
  imports: [CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './dashboard-page.html',
  styleUrls: ['./dashboard-page.scss', '../../account-page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage {
  protected readonly auth = inject(AuthStore);
  private readonly ordersRepository = inject(OrderRepository);
  protected readonly orders = toSignal(
    this.ordersRepository.getOrders({ page: 1, pageSize: 6 }).pipe(
      map(({ data }): DashboardOrders => ({ status: 'success', orders: data })),
      startWith<DashboardOrders>({ status: 'loading', orders: [] }),
      catchError(() => of<DashboardOrders>({ status: 'error', orders: [] })),
    ),
    { requireSync: true },
  );

  protected statusLabel(status: Order['status']): string {
    return status.replaceAll('-', ' ');
  }
}
