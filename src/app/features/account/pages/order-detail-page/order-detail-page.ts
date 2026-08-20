import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, distinctUntilChanged, map, of, startWith, switchMap } from 'rxjs';

import { OrderRepository } from '@core/data-access';
import type { Order, OrderStatus, PaymentMethod } from '@core/domain';

type DetailState =
  | { status: 'loading'; order: null }
  | { status: 'error'; order: null }
  | { status: 'success'; order: Order };
const STEPS: readonly OrderStatus[] = ['received', 'processing', 'on-the-way', 'delivered'];

@Component({
  selector: 'app-order-detail-page',
  imports: [CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './order-detail-page.html',
  styleUrls: ['./order-detail-page.scss', '../../account-page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly repository = inject(OrderRepository);
  protected readonly steps = STEPS;
  protected readonly state = toSignal(
    this.route.paramMap.pipe(
      map((params) => params.get('orderId') ?? ''),
      distinctUntilChanged(),
      switchMap((orderId) =>
        this.repository.getOrder(orderId).pipe(
          map((order): DetailState => ({ status: 'success', order })),
          startWith<DetailState>({ status: 'loading', order: null }),
          catchError(() => of<DetailState>({ status: 'error', order: null })),
        ),
      ),
    ),
    { requireSync: true },
  );

  protected stepReached(order: Order, step: OrderStatus): boolean {
    return order.status !== 'cancelled' && STEPS.indexOf(step) <= STEPS.indexOf(order.status);
  }
  protected statusLabel(status: OrderStatus): string {
    return status.replaceAll('-', ' ');
  }
  protected paymentLabel(method: PaymentMethod): string {
    return method.replaceAll('-', ' ');
  }
}
