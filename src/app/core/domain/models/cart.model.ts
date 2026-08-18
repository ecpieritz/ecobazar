import { EntityId, IsoDateString, Money } from './common.model';
import type { Product } from './product.model';

export interface CartItem {
  readonly productId: EntityId;
  readonly quantity: number;
}

export interface ShoppingCart {
  readonly id: EntityId;
  readonly customerId?: EntityId;
  readonly items: readonly CartItem[];
  readonly couponCode?: string;
  readonly updatedAt: IsoDateString;
}

export interface CartTotals {
  readonly itemCount: number;
  readonly subtotal: Money;
  readonly discount: Money;
  readonly shipping: Money;
  readonly total: Money;
}

export interface CartLine {
  readonly product: Product;
  readonly quantity: number;
  readonly subtotal: Money;
}
