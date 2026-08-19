import { TestBed } from '@angular/core/testing';

import { PRODUCTS_FIXTURE } from '@core/mock-api/fixtures';
import { LOCAL_STORAGE } from '@core/persistence';

import { ShoppingCartStore } from '../cart';
import { WishlistStore } from './wishlist.store';

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

describe('WishlistStore', () => {
  let storage: MemoryStorage;
  let wishlist: WishlistStore;
  const apple = PRODUCTS_FIXTURE.find(({ slug }) => slug === 'green-apple')!;
  const cabbage = PRODUCTS_FIXTURE.find(({ slug }) => slug === 'chinese-cabbage')!;

  beforeEach(() => {
    storage = new MemoryStorage();
    TestBed.configureTestingModule({ providers: [{ provide: LOCAL_STORAGE, useValue: storage }] });
    wishlist = TestBed.inject(WishlistStore);
  });

  it('adds, toggles, and removes unique products', () => {
    expect(wishlist.addProduct(apple)).toBe(true);
    expect(wishlist.addProduct(apple)).toBe(false);
    expect(wishlist.itemCount()).toBe(1);
    expect(wishlist.hasProduct(apple.id)).toBe(true);

    expect(wishlist.toggleProduct(apple)).toBe(false);
    expect(wishlist.isEmpty()).toBe(true);
    expect(wishlist.toggleProduct(cabbage)).toBe(true);
    expect(wishlist.products()).toEqual([cabbage]);
  });

  it('persists and restores product snapshots', () => {
    wishlist.addProduct(apple);
    expect(storage.getItem('ecobazar:wishlist')).toContain('"version":1');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [{ provide: LOCAL_STORAGE, useValue: storage }] });
    const restoredWishlist = TestBed.inject(WishlistStore);

    expect(restoredWishlist.products()).toEqual([apple]);
    expect(restoredWishlist.hasProduct(apple.id)).toBe(true);
  });

  it('moves available products to the cart and keeps rejected products saved', () => {
    const shoppingCart = TestBed.inject(ShoppingCartStore);
    const unavailableApple = {
      ...apple,
      inventory: { quantity: 0, status: 'out-of-stock' as const },
    };
    wishlist.addProduct(cabbage);
    wishlist.addProduct(unavailableApple);

    expect(wishlist.moveToCart(cabbage.id)).toBe(1);
    expect(shoppingCart.lines()[0]?.product.id).toBe(cabbage.id);
    expect(wishlist.hasProduct(cabbage.id)).toBe(false);

    expect(wishlist.moveToCart(unavailableApple.id)).toBe(0);
    expect(wishlist.hasProduct(unavailableApple.id)).toBe(true);
  });

  it('clears the wishlist and its persisted snapshot', () => {
    wishlist.addProduct(apple);
    wishlist.clear();

    expect(wishlist.isEmpty()).toBe(true);
    expect(storage.getItem('ecobazar:wishlist')).toBeNull();
  });
});
