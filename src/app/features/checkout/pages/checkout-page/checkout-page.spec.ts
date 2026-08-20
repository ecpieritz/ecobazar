import { HttpErrorResponse } from '@angular/common/http';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { AuthStore } from '@core/auth';
import { OrderRepository } from '@core/data-access';
import {
  MOCK_CUSTOMER_FIXTURE,
  MOCK_ORDERS_FIXTURE,
  PRODUCTS_FIXTURE,
} from '@core/mock-api/fixtures';
import { LOCAL_STORAGE } from '@core/persistence';
import { ShoppingCartStore } from '@core/state';

import { CheckoutPage } from './checkout-page';

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

describe('CheckoutPage', () => {
  const product = PRODUCTS_FIXTURE.find(({ slug }) => slug === 'green-apple')!;
  const repository = { placeOrder: vi.fn() };

  beforeEach(async () => {
    repository.placeOrder.mockReset().mockReturnValue(of(MOCK_ORDERS_FIXTURE[0]));
    await TestBed.configureTestingModule({
      imports: [CheckoutPage],
      providers: [
        provideRouter([]),
        { provide: LOCAL_STORAGE, useFactory: () => new MemoryStorage() },
        { provide: AuthStore, useValue: { customer: signal(MOCK_CUSTOMER_FIXTURE) } },
        { provide: OrderRepository, useValue: repository },
      ],
    }).compileComponents();
  });

  it('should render an empty checkout state without cart products', () => {
    const fixture = TestBed.createComponent(CheckoutPage);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Your cart is empty');
    expect(repository.placeOrder).not.toHaveBeenCalled();
  });

  it('should prefill billing data and render reactive cart totals', () => {
    const cart = TestBed.inject(ShoppingCartStore);
    cart.addProduct(product, 2);
    const fixture = TestBed.createComponent(CheckoutPage);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect((element.querySelector('[formcontrolname="firstName"]') as HTMLInputElement).value).toBe(
      MOCK_CUSTOMER_FIXTURE.firstName,
    );
    expect(element.querySelector('.summary-products')?.textContent).toContain(product.name);
    expect(element.querySelector('.summary-totals .total')?.textContent).toContain(
      cart.totals().total.amount.toFixed(2),
    );
  });

  it('should keep invalid forms from placing an order', () => {
    TestBed.inject(ShoppingCartStore).addProduct(product);
    const fixture = TestBed.createComponent(CheckoutPage);
    fixture.detectChanges();
    const firstName = fixture.nativeElement.querySelector(
      '[formcontrolname="firstName"]',
    ) as HTMLInputElement;

    firstName.value = '';
    firstName.dispatchEvent(new Event('input'));
    (fixture.nativeElement.querySelector('form') as HTMLFormElement).dispatchEvent(
      new Event('submit'),
    );
    fixture.detectChanges();

    expect(repository.placeOrder).not.toHaveBeenCalled();
    expect(firstName.classList).toContain('ng-invalid');
  });

  it('should place an order, clear the cart, and show its confirmation', () => {
    const cart = TestBed.inject(ShoppingCartStore);
    cart.addProduct(product, 2);
    const fixture = TestBed.createComponent(CheckoutPage);
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('form') as HTMLFormElement).dispatchEvent(
      new Event('submit'),
    );
    fixture.detectChanges();

    expect(repository.placeOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        items: [{ productId: product.id, quantity: 2 }],
        paymentMethod: 'cash-on-delivery',
      }),
    );
    expect(cart.isEmpty()).toBe(true);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Thank you for your order!',
    );
  });

  it('should preserve the cart and display mocked API errors', () => {
    repository.placeOrder.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 409,
            error: { error: { code: 'STOCK_UNAVAILABLE', message: 'Stock changed.' } },
          }),
      ),
    );
    const cart = TestBed.inject(ShoppingCartStore);
    cart.addProduct(product);
    const fixture = TestBed.createComponent(CheckoutPage);
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('form') as HTMLFormElement).dispatchEvent(
      new Event('submit'),
    );
    fixture.detectChanges();

    expect(cart.isEmpty()).toBe(false);
    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain(
      'Stock changed.',
    );
  });
});
