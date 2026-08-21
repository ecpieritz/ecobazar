import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import type { AddressPayload } from '@core/api';
import { AuthSessionStorage, authTokenInterceptor } from '@core/auth';
import { AuthRepository, OrderRepository, ProductRepository } from '@core/data-access';
import {
  MOCK_BILLING_ADDRESS,
  MOCK_CUSTOMER_EMAIL,
  MOCK_CUSTOMER_PASSWORD,
} from '@core/mock-api/fixtures';
import { LOCAL_STORAGE } from '@core/persistence';

import { mockApiInterceptor } from './http/mock-api.interceptor';

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

describe('critical mocked storefront journey', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authTokenInterceptor, mockApiInterceptor])),
        { provide: LOCAL_STORAGE, useFactory: () => new MemoryStorage() },
      ],
    });
  });

  it('should authenticate, browse products, place an order, and expose it in history', async () => {
    const auth = TestBed.inject(AuthRepository);
    const sessionStorage = TestBed.inject(AuthSessionStorage);
    const products = TestBed.inject(ProductRepository);
    const orders = TestBed.inject(OrderRepository);
    const session = await firstValueFrom(
      auth.login({
        email: MOCK_CUSTOMER_EMAIL,
        password: MOCK_CUSTOMER_PASSWORD,
        rememberMe: false,
      }),
    );
    sessionStorage.set(session, false);

    const catalog = await firstValueFrom(
      products.getProducts({ category: 'vegetables', inStock: true, pageSize: 4 }),
    );
    const product = catalog.data[0];
    const address: AddressPayload = {
      firstName: MOCK_BILLING_ADDRESS.firstName,
      lastName: MOCK_BILLING_ADDRESS.lastName,
      company: MOCK_BILLING_ADDRESS.company,
      street: MOCK_BILLING_ADDRESS.street,
      city: MOCK_BILLING_ADDRESS.city,
      state: MOCK_BILLING_ADDRESS.state,
      postalCode: MOCK_BILLING_ADDRESS.postalCode,
      country: MOCK_BILLING_ADDRESS.country,
      email: MOCK_BILLING_ADDRESS.email,
      phone: MOCK_BILLING_ADDRESS.phone,
    };
    const order = await firstValueFrom(
      orders.placeOrder({
        items: [{ productId: product.id, quantity: 1 }],
        billingAddress: address,
        shippingAddress: address,
        paymentMethod: 'cash-on-delivery',
        notes: 'Mock integration order',
      }),
    );
    const history = await firstValueFrom(orders.getOrders({ page: 1, pageSize: 20 }));

    expect(session.customer.email).toBe(MOCK_CUSTOMER_EMAIL);
    expect(catalog.data).toHaveLength(4);
    expect(order.items[0]).toMatchObject({ productId: product.id, quantity: 1 });
    expect(history.data.some(({ id }) => id === order.id)).toBe(true);
  });
});
