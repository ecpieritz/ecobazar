import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { PRODUCTS_FIXTURE } from '@core/mock-api/fixtures';
import { LOCAL_STORAGE } from '@core/persistence';
import { ShoppingCartStore } from '@core/state';

import { CartPage } from './cart-page';

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

describe('CartPage', () => {
  const apple = PRODUCTS_FIXTURE.find(({ slug }) => slug === 'green-apple')!;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartPage],
      providers: [
        provideRouter([]),
        { provide: LOCAL_STORAGE, useFactory: () => new MemoryStorage() },
      ],
    }).compileComponents();
  });

  it('renders an empty state when no products are in the cart', () => {
    const fixture = TestBed.createComponent(CartPage);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Your cart is empty');
  });

  it('updates quantities and recalculates shipping and totals', () => {
    const store = TestBed.inject(ShoppingCartStore);
    store.addProduct(apple);
    const fixture = TestBed.createComponent(CartPage);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('.cart-line__product')?.textContent).toContain(apple.name);
    expect(store.totals().shipping.amount).toBe(5);

    (
      element.querySelector(`[aria-label="Increase ${apple.name} quantity"]`) as HTMLButtonElement
    ).click();
    fixture.detectChanges();

    expect(store.itemCount()).toBe(2);
    expect(element.querySelector('.cart-summary__total')?.textContent).toContain(
      store.totals().total.amount.toFixed(2),
    );
  });

  it('applies and removes a mock coupon from the summary', () => {
    const store = TestBed.inject(ShoppingCartStore);
    store.addProduct(apple, 2);
    const fixture = TestBed.createComponent(CartPage);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const input = element.querySelector('#coupon-code') as HTMLInputElement;

    input.value = 'fresh10';
    input.dispatchEvent(new Event('input'));
    (element.querySelector('.coupon-card form') as HTMLFormElement).dispatchEvent(
      new Event('submit', { cancelable: true }),
    );
    fixture.detectChanges();

    expect(store.appliedCoupon()?.code).toBe('FRESH10');
    expect(element.querySelector('.cart-summary__discount')?.textContent).toContain('FRESH10');
    expect(element.querySelector('.coupon-feedback')?.textContent).toContain('was applied');

    (element.querySelector('.applied-coupon button') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(store.appliedCoupon()).toBeNull();
  });
});
