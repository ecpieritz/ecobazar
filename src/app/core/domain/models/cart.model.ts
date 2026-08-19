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

export type CouponDiscountType = 'fixed' | 'percentage';

export interface Coupon {
  readonly code: string;
  readonly description: string;
  readonly discountType: CouponDiscountType;
  readonly discountValue: number;
  readonly minimumSubtotal: number;
}

export type CouponApplicationStatus = 'applied' | 'empty-cart' | 'invalid' | 'minimum-not-met';

export interface CouponApplicationResult {
  readonly status: CouponApplicationStatus;
  readonly message: string;
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
