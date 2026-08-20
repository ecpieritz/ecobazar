import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, distinctUntilChanged, map, of, startWith, switchMap } from 'rxjs';

import type { PaginationMeta } from '@core/api';
import { OrderRepository } from '@core/data-access';
import type { Order } from '@core/domain';

interface HistoryState {
  status: 'loading' | 'success' | 'error';
  orders: readonly Order[];
  pagination: PaginationMeta;
}
const EMPTY_PAGINATION: PaginationMeta = { page: 1, pageSize: 8, totalItems: 0, totalPages: 0 };

@Component({
  selector: 'app-order-history-page',
  imports: [CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './order-history-page.html',
  styleUrls: ['./order-history-page.scss', '../../account-page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderHistoryPage {
  private readonly repository = inject(OrderRepository);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly state = toSignal(
    this.route.queryParamMap.pipe(
      map((params) => Math.max(1, Number(params.get('page')) || 1)),
      distinctUntilChanged(),
      switchMap((page) =>
        this.repository.getOrders({ page, pageSize: 8 }).pipe(
          map(({ data, pagination }): HistoryState => ({
            status: 'success',
            orders: data,
            pagination,
          })),
          startWith<HistoryState>({
            status: 'loading',
            orders: [],
            pagination: { ...EMPTY_PAGINATION, page },
          }),
          catchError(() =>
            of<HistoryState>({ status: 'error', orders: [], pagination: EMPTY_PAGINATION }),
          ),
        ),
      ),
    ),
    { requireSync: true },
  );

  protected readonly pageNumbers = computed(() =>
    Array.from({ length: this.state().pagination.totalPages }, (_, index) => index + 1),
  );

  protected statusLabel(status: Order['status']): string {
    return status.replaceAll('-', ' ');
  }
  protected goToPage(page: number): void {
    if (page < 1 || page > this.state().pagination.totalPages) return;
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: page === 1 ? null : page },
      queryParamsHandling: 'merge',
    });
  }
}
