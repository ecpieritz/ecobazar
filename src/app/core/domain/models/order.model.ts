import { Address } from './address.model';
import { EntityId, ImageAsset, IsoDateString, Money } from './common.model';

export type OrderStatus = 'received' | 'processing' | 'on-the-way' | 'delivered' | 'cancelled';

export type PaymentMethod = 'cash-on-delivery' | 'paypal' | 'amazon-pay';

export interface OrderItem {
  readonly productId: EntityId;
  readonly productName: string;
  readonly productSlug: string;
  readonly sku: string;
  readonly image: ImageAsset;
  readonly unitPrice: Money;
  readonly quantity: number;
  readonly subtotal: Money;
}

export interface OrderStatusEvent {
  readonly status: OrderStatus;
  readonly occurredAt: IsoDateString;
}

export interface OrderTotals {
  readonly subtotal: Money;
  readonly discount: Money;
  readonly shipping: Money;
  readonly total: Money;
}

export interface Order {
  readonly id: EntityId;
  readonly customerId: EntityId;
  readonly items: readonly OrderItem[];
  readonly billingAddress: Address;
  readonly shippingAddress: Address;
  readonly paymentMethod: PaymentMethod;
  readonly status: OrderStatus;
  readonly statusHistory: readonly OrderStatusEvent[];
  readonly totals: OrderTotals;
  readonly couponCode?: string;
  readonly notes?: string;
  readonly placedAt: IsoDateString;
  readonly updatedAt: IsoDateString;
}
