import { EntityId, Order, PaymentMethod } from '@core/domain';

import { AddressPayload } from './customer.contracts';
import { ApiResponse, PaginatedApiResponse, PaginationQuery } from './api.contracts';

export interface CheckoutItemRequest {
  readonly productId: EntityId;
  readonly quantity: number;
}

export interface PlaceOrderRequest {
  readonly items: readonly CheckoutItemRequest[];
  readonly billingAddress: AddressPayload;
  readonly shippingAddress: AddressPayload;
  readonly paymentMethod: PaymentMethod;
  readonly couponCode?: string;
  readonly notes?: string;
}

export type OrderListQuery = PaginationQuery;
export type OrderListResponse = PaginatedApiResponse<Order>;
export type OrderResponse = ApiResponse<Order>;
