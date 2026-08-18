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
    const persistedValue = storage.getItem('ecobazar:shopping-cart');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [{ provide: LOCAL_STORAGE, useValue: storage }] });
    const restoredStore = TestBed.inject(ShoppingCartStore);

    expect(persistedValue).toContain('"version":1');
    expect(restoredStore.itemCount()).toBe(2);
    expect(restoredStore.lines()[0]?.product).toEqual(apple);
    expect(restoredStore.subtotal().amount).toBe(apple.price.amount * 2);
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
