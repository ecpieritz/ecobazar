import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, type Observable } from 'rxjs';

import {
  API_ENDPOINTS,
  type OrderListQuery,
  type OrderListResponse,
  type OrderResponse,
} from '@core/api';
import type { Order } from '@core/domain';

import { apiUrl } from '../http/api-url';

@Injectable({ providedIn: 'root' })
export class OrderRepository {
  private readonly http = inject(HttpClient);

  getOrders(query: OrderListQuery = {}): Observable<OrderListResponse> {
    let params = new HttpParams();
    if (query.page !== undefined) params = params.set('page', query.page);
    if (query.pageSize !== undefined) params = params.set('pageSize', query.pageSize);
    return this.http.get<OrderListResponse>(apiUrl(API_ENDPOINTS.orders.collection), { params });
  }

  getOrder(orderId: string): Observable<Order> {
    return this.http
      .get<OrderResponse>(apiUrl(API_ENDPOINTS.orders.byId(orderId)))
      .pipe(map(({ data }) => data));
  }
}
