import { TestBed } from '@angular/core/testing';

import { PRODUCTS_FIXTURE } from '@core/mock-api/fixtures';
import { LOCAL_STORAGE } from '@core/persistence';

import { ShoppingCartStore } from './shopping-cart.store';

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>();

  get length(): number {
    return this.values.size;
  }

  clear(): void {
    this.values.clear();
  }

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  key(index: number): string | null {
    return [...this.values.keys()][index] ?? null;
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

describe('ShoppingCartStore', () => {
  let storage: MemoryStorage;
  let store: ShoppingCartStore;
  const apple = PRODUCTS_FIXTURE.find(({ slug }) => slug === 'green-apple')!;
  const cabbage = PRODUCTS_FIXTURE.find(({ slug }) => slug === 'chinese-cabbage')!;

  beforeEach(() => {
    storage = new MemoryStorage();
    TestBed.configureTestingModule({ providers: [{ provide: LOCAL_STORAGE, useValue: storage }] });
    store = TestBed.inject(ShoppingCartStore);
  });

  it('starts empty with consistent derived totals', () => {
    expect(store.isEmpty()).toBe(true);
    expect(store.itemCount()).toBe(0);
    expect(store.lineCount()).toBe(0);
    expect(store.lines()).toEqual([]);
    expect(store.totals()).toEqual({
      itemCount: 0,
      subtotal: { amount: 0, currency: 'USD' },
      discount: { amount: 0, currency: 'USD' },
      shipping: { amount: 0, currency: 'USD' },
      total: { amount: 0, currency: 'USD' },
    });
  });

  it('merges repeated products and derives line and cart totals', () => {
    expect(store.addProduct(apple, 2)).toBe(2);
    expect(store.addProduct(apple)).toBe(1);
    expect(store.addProduct(cabbage, 2)).toBe(2);

    expect(store.lineCount()).toBe(2);
    expect(store.itemCount()).toBe(5);
    expect(store.lines()[0]).toEqual({
      product: apple,
      quantity: 3,
      subtotal: { amount: apple.price.amount * 3, currency: 'USD' },
    });
    expect(store.subtotal().amount).toBe(apple.price.amount * 3 + cabbage.price.amount * 2);
    expect(store.totals().total).toEqual(store.subtotal());
  });

  it('caps quantities at inventory and removes zero-quantity items', () => {
    const limitedApple = { ...apple, inventory: { quantity: 3, status: 'low-stock' as const } };

    expect(store.addProduct(limitedApple, 10)).toBe(3);
    expect(store.addProduct(limitedApple)).toBe(0);
    expect(store.updateQuantity(limitedApple.id, 2)).toBe(2);
    expect(store.updateQuantity(limitedApple.id, 0)).toBe(0);
    expect(store.isEmpty()).toBe(true);
  });

  it('persists product snapshots and restores totals synchronously', () => {
    store.addProduct(apple, 2);
    store.applyCoupon('fresh10');
    const persistedValue = storage.getItem('ecobazar:shopping-cart');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [{ provide: LOCAL_STORAGE, useValue: storage }] });
    const restoredStore = TestBed.inject(ShoppingCartStore);

    expect(persistedValue).toContain('"version":2');
    expect(persistedValue).toContain('"couponCode":"FRESH10"');
    expect(restoredStore.itemCount()).toBe(2);
    expect(restoredStore.appliedCoupon()?.code).toBe('FRESH10');
    expect(restoredStore.lines()[0]?.product).toEqual(apple);
    expect(restoredStore.subtotal().amount).toBe(apple.price.amount * 2);
  });

  it('calculates standard and free shipping from the subtotal', () => {
    store.addProduct(apple);

    expect(store.totals().shipping.amount).toBe(5);
    expect(store.totals().total.amount).toBeCloseTo(apple.price.amount + 5, 2);

    store.updateQuantity(apple.id, 4);

    expect(store.subtotal().amount).toBeGreaterThanOrEqual(50);
    expect(store.totals().shipping.amount).toBe(0);
    expect(store.totals().total).toEqual(store.subtotal());
  });

  it('applies normalized percentage and fixed coupons to eligible carts', () => {
    store.addProduct(apple, 2);

    expect(store.applyCoupon(' fresh10 ')).toEqual({
      status: 'applied',
      message: 'FRESH10 was applied to your cart.',
    });
    expect(store.appliedCoupon()?.code).toBe('FRESH10');
    expect(store.totals().discount.amount).toBe(
      Math.round(apple.price.amount * 2 * 0.1 * 100) / 100,
    );

    expect(store.applyCoupon('SAVE5').status).toBe('applied');
    expect(store.totals().discount.amount).toBe(5);

    store.removeCoupon();
    expect(store.appliedCoupon()).toBeNull();
    expect(store.totals().discount.amount).toBe(0);
  });

  it('rejects invalid, ineligible, and empty-cart coupons', () => {
    expect(store.applyCoupon('FRESH10').status).toBe('empty-cart');
    store.addProduct(apple);

    expect(store.applyCoupon('unknown').status).toBe('invalid');
    expect(store.applyCoupon('FRESH10').status).toBe('minimum-not-met');
    expect(store.appliedCoupon()).toBeNull();
  });

  it('removes an applied coupon when the subtotal drops below its minimum', () => {
    store.addProduct(apple, 2);
    expect(store.applyCoupon('FRESH10').status).toBe('applied');

    store.updateQuantity(apple.id, 1);

    expect(store.appliedCoupon()).toBeNull();
    expect(store.cart().couponCode).toBeUndefined();
    expect(store.totals().discount.amount).toBe(0);
  });

  it('clears state and its persisted snapshot', () => {
    store.addProduct(apple);

    store.clear();

    expect(store.isEmpty()).toBe(true);
    expect(storage.getItem('ecobazar:shopping-cart')).toBeNull();
  });

  it('ignores malformed or orphaned persisted lines', () => {
    storage.setItem(
      'ecobazar:shopping-cart',
      JSON.stringify({
        version: 1,
        items: [{ productId: 'missing-product', quantity: 2 }],
        products: [],
        updatedAt: 'invalid-but-safe',
      }),
    );
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [{ provide: LOCAL_STORAGE, useValue: storage }] });

    expect(TestBed.inject(ShoppingCartStore).isEmpty()).toBe(true);
  });
});
