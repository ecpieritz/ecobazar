import { computed, inject, Injectable, signal } from '@angular/core';

import type {
  CartLine,
  CartTotals,
  CouponApplicationResult,
  EntityId,
  Product,
  ShoppingCart,
} from '@core/domain';
import { LocalStorageService } from '@core/persistence';

import {
  type CartStoreState,
  emptyCartState,
  persistCartState,
  restoreCartState,
} from './cart-storage';
import {
  calculateCouponDiscount,
  calculateShipping,
  findMockCoupon,
  normalizeCouponCode,
} from './cart-pricing';

const CART_ID = 'local-shopping-cart';
const roundCurrency = (amount: number): number => Math.round((amount + Number.EPSILON) * 100) / 100;
const eligibleCouponCode = (
  items: CartStoreState['items'],
  products: CartStoreState['products'],
  couponCode?: string | null,
): string | undefined => {
  const coupon = findMockCoupon(couponCode ?? undefined);
  const subtotal = roundCurrency(
    items.reduce((total, { productId, quantity }) => {
      const product = products.get(productId);
      return total + (product?.price.amount ?? 0) * quantity;
    }, 0),
  );

  return coupon && subtotal >= coupon.minimumSubtotal ? coupon.code : undefined;
};

@Injectable({ providedIn: 'root' })
export class ShoppingCartStore {
  private readonly storage = inject(LocalStorageService);
  private readonly state = signal<CartStoreState>(this.restoreState());

  readonly items = computed(() => this.state().items);
  readonly cart = computed<ShoppingCart>(() => ({
    id: CART_ID,
    items: this.items(),
    ...(this.state().couponCode ? { couponCode: this.state().couponCode } : {}),
    updatedAt: this.state().updatedAt,
  }));
  readonly lines = computed<readonly CartLine[]>(() =>
    this.items().flatMap(({ productId, quantity }) => {
      const product = this.state().products.get(productId);

      return product
        ? [
            {
              product,
              quantity,
              subtotal: {
                amount: roundCurrency(product.price.amount * quantity),
                currency: product.price.currency,
              },
            },
          ]
        : [];
    }),
  );
  readonly itemCount = computed(() =>
    this.items().reduce((total, { quantity }) => total + quantity, 0),
  );
  readonly lineCount = computed(() => this.items().length);
  readonly isEmpty = computed(() => this.itemCount() === 0);
  readonly subtotal = computed(() => ({
    amount: roundCurrency(this.lines().reduce((total, { subtotal }) => total + subtotal.amount, 0)),
    currency: 'USD' as const,
  }));
  readonly appliedCoupon = computed(() => findMockCoupon(this.state().couponCode));
  readonly totals = computed<CartTotals>(() => {
    const subtotal = this.subtotal();
    const discountAmount = roundCurrency(
      calculateCouponDiscount(subtotal.amount, this.appliedCoupon()),
    );
    const shippingAmount = roundCurrency(calculateShipping(subtotal.amount));
    const discount = { amount: discountAmount, currency: subtotal.currency } as const;
    const shipping = { amount: shippingAmount, currency: subtotal.currency } as const;
    const total = {
      amount: roundCurrency(Math.max(0, subtotal.amount - discountAmount) + shippingAmount),
      currency: subtotal.currency,
    } as const;

    return {
      itemCount: this.itemCount(),
      subtotal,
      discount,
      shipping,
      total,
    };
  });

  addProduct(product: Product, quantity = 1): number {
    const requestedQuantity = Math.floor(quantity);
    const availableQuantity = Math.max(0, Math.floor(product.inventory.quantity));

    if (!Number.isFinite(requestedQuantity) || requestedQuantity <= 0 || availableQuantity === 0) {
      return 0;
    }

    const state = this.state();
    const currentQuantity =
      state.items.find(({ productId }) => productId === product.id)?.quantity ?? 0;
    const nextQuantity = Math.min(availableQuantity, currentQuantity + requestedQuantity);
    const addedQuantity = nextQuantity - currentQuantity;

    if (addedQuantity <= 0) {
      return 0;
    }

    const items = currentQuantity
      ? state.items.map((item) =>
          item.productId === product.id ? { ...item, quantity: nextQuantity } : item,
        )
      : [...state.items, { productId: product.id, quantity: nextQuantity }];
    const products = new Map(state.products);
    products.set(product.id, product);
    this.commit(items, products);
    return addedQuantity;
  }

  updateQuantity(productId: EntityId, quantity: number): number {
    if (!Number.isFinite(quantity) || quantity <= 0) {
      this.removeProduct(productId);
      return 0;
    }

    const state = this.state();
    const product = state.products.get(productId);

    if (!product || !state.items.some((item) => item.productId === productId)) {
      return 0;
    }

    const nextQuantity = Math.min(product.inventory.quantity, Math.max(1, Math.floor(quantity)));
    const items = state.items.map((item) =>
      item.productId === productId ? { ...item, quantity: nextQuantity } : item,
    );
    this.commit(items, state.products);
    return nextQuantity;
  }

  removeProduct(productId: EntityId): void {
    const state = this.state();

    if (!state.items.some((item) => item.productId === productId)) {
      return;
    }

    const products = new Map(state.products);
    products.delete(productId);
    this.commit(
      state.items.filter((item) => item.productId !== productId),
      products,
    );
  }

  applyCoupon(code: string): CouponApplicationResult {
    if (this.isEmpty()) {
      return { status: 'empty-cart', message: 'Add products before applying a coupon.' };
    }

    const normalizedCode = normalizeCouponCode(code);
    const coupon = findMockCoupon(normalizedCode);

    if (!coupon) {
      return { status: 'invalid', message: 'This coupon code is not valid.' };
    }

    if (this.subtotal().amount < coupon.minimumSubtotal) {
      return {
        status: 'minimum-not-met',
        message: `This coupon requires a minimum subtotal of $${coupon.minimumSubtotal.toFixed(2)}.`,
      };
    }

    const state = this.state();
    this.commit(state.items, state.products, normalizedCode);
    return { status: 'applied', message: `${normalizedCode} was applied to your cart.` };
  }

  removeCoupon(): void {
    const state = this.state();

    if (!state.couponCode) {
      return;
    }

    this.commit(state.items, state.products, null);
  }

  clear(): void {
    const state = emptyCartState();
    this.state.set(state);
    persistCartState(this.storage, state);
  }

  private commit(
    items: readonly { productId: EntityId; quantity: number }[],
    products: ReadonlyMap<EntityId, Product>,
    couponCode: string | null | undefined = this.state().couponCode,
  ): void {
    const eligibleCode = eligibleCouponCode(items, products, couponCode);
    const state: CartStoreState = {
      items,
      products,
      ...(eligibleCode ? { couponCode: eligibleCode } : {}),
      updatedAt: new Date().toISOString(),
    };
    this.state.set(state);
    persistCartState(this.storage, state);
  }

  private restoreState(): CartStoreState {
    const state = restoreCartState(this.storage);
    const couponCode = eligibleCouponCode(state.items, state.products, state.couponCode);
    return {
      items: state.items,
      products: state.products,
      ...(couponCode ? { couponCode } : {}),
      updatedAt: state.updatedAt,
    };
  }
}
