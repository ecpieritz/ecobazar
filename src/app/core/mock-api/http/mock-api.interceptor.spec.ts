import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';

import type {
  AddressPayload,
  AuthResponse,
  CategoryListResponse,
  OrderListResponse,
  OrderResponse,
  ProductFilterOptionsResponse,
  ProductListResponse,
  ProductResponse,
  ReviewListResponse,
} from '@core/api';
import {
  MOCK_BILLING_ADDRESS,
  MOCK_CUSTOMER_EMAIL,
  MOCK_CUSTOMER_PASSWORD,
  PRODUCTS_FIXTURE,
} from '@core/mock-api/fixtures';

import { mockApiInterceptor } from './mock-api.interceptor';

describe('mockApiInterceptor', () => {
  const checkoutAddress: AddressPayload = {
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
  let http: HttpClient;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([mockApiInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should filter, sort, and paginate products', async () => {
    const response = await firstValueFrom(
      http.get<ProductListResponse>(
        '/api/products?category=vegetables&minimumRating=5&sort=price-descending&pageSize=2',
      ),
    );

    expect(response.data).toHaveLength(2);
    expect(response.pagination).toEqual({ page: 1, pageSize: 2, totalItems: 3, totalPages: 2 });
    expect(response.data[0].name).toBe('Red Capsicum');
    expect(response.data[1].name).toBe('Green Capsicum');
  });

  it('should search products by name without case sensitivity', async () => {
    const response = await firstValueFrom(
      http.get<ProductListResponse>('/api/products?search=GREEN%20APPLE'),
    );

    expect(response.data).toHaveLength(1);
    expect(response.data[0].slug).toBe('green-apple');
  });

  it('should return a product by slug', async () => {
    const response = await firstValueFrom(
      http.get<ProductResponse>('/api/products/chinese-cabbage'),
    );

    expect(response.data.slug).toBe('chinese-cabbage');
    expect(response.data.images).toHaveLength(4);
  });

  it('should derive filter options from the product catalog', async () => {
    const response = await firstValueFrom(
      http.get<ProductFilterOptionsResponse>('/api/products/filter-options'),
    );

    expect(response.data.priceRange).toEqual({ minimum: 9, maximum: 32, currency: 'USD' });
    expect(response.data.ratings).toHaveLength(5);
    expect(response.data.tags[0]).toMatchObject({ value: 'vegetables', productCount: 13 });
  });

  it('should support sale and featured storefront filters', async () => {
    const response = await firstValueFrom(
      http.get<ProductListResponse>('/api/products?sale=true&featured=true&pageSize=100'),
    );

    expect(response.data.length).toBeGreaterThan(0);
    expect(
      response.data.every(
        ({ compareAtPrice, featured, price }) =>
          featured && (compareAtPrice?.amount ?? 0) > price.amount,
      ),
    ).toBe(true);
  });

  it('should return categories and paginated product reviews', async () => {
    const [categories, reviews] = await Promise.all([
      firstValueFrom(http.get<CategoryListResponse>('/api/categories')),
      firstValueFrom(
        http.get<ReviewListResponse>(
          '/api/products/product-chinese-cabbage/reviews?page=1&pageSize=2',
        ),
      ),
    ]);

    expect(categories.data).toHaveLength(7);
    expect(reviews.data).toHaveLength(2);
    expect(reviews.pagination).toEqual({ page: 1, pageSize: 2, totalItems: 4, totalPages: 2 });
  });

  it('should return typed errors for invalid and unknown requests', async () => {
    const invalidRequest = firstValueFrom(http.get('/api/products?page=0'));
    const unknownRequest = firstValueFrom(http.get('/api/products/unknown-product'));

    await expect(invalidRequest).rejects.toMatchObject({
      status: 400,
      error: { error: { code: 'INVALID_QUERY' } },
    });
    await expect(unknownRequest).rejects.toMatchObject({
      status: 404,
      error: { error: { code: 'PRODUCT_NOT_FOUND' } },
    });
  });

  it('should forward requests outside the mock API', async () => {
    const responsePromise = firstValueFrom(http.get<{ ready: boolean }>('/assets/config.json'));
    const request = httpTesting.expectOne('/assets/config.json');

    request.flush({ ready: true });

    await expect(responsePromise).resolves.toEqual({ ready: true });
  });

  it('should authenticate the demo customer and authorize account requests', async () => {
    const auth = await firstValueFrom(
      http.post<AuthResponse>('/api/auth/login', {
        email: MOCK_CUSTOMER_EMAIL,
        password: MOCK_CUSTOMER_PASSWORD,
        rememberMe: true,
      }),
    );
    const orders = await firstValueFrom(
      http.get<OrderListResponse>('/api/orders?page=1&pageSize=3', {
        headers: { Authorization: `Bearer ${auth.data.accessToken}` },
      }),
    );

    expect(auth.data.customer.email).toBe(MOCK_CUSTOMER_EMAIL);
    expect(orders.data).toHaveLength(3);
    expect(orders.pagination.totalItems).toBeGreaterThan(3);
  });

  it('should reject protected account requests without a session token', async () => {
    const request = firstValueFrom(http.get('/api/customers/me'));

    await expect(request).rejects.toMatchObject({
      status: 401,
      error: { error: { code: 'UNAUTHORIZED' } },
    });
  });

  it('should place an order and include it in the customer history', async () => {
    const auth = await firstValueFrom(
      http.post<AuthResponse>('/api/auth/login', {
        email: MOCK_CUSTOMER_EMAIL,
        password: MOCK_CUSTOMER_PASSWORD,
        rememberMe: true,
      }),
    );
    const headers = { Authorization: `Bearer ${auth.data.accessToken}` };
    const before = await firstValueFrom(
      http.get<OrderListResponse>('/api/orders?page=1&pageSize=50', { headers }),
    );
    const created = await firstValueFrom(
      http.post<OrderResponse>(
        '/api/orders',
        {
          items: [{ productId: PRODUCTS_FIXTURE[0].id, quantity: 2 }],
          billingAddress: checkoutAddress,
          shippingAddress: checkoutAddress,
          paymentMethod: 'paypal',
          couponCode: 'FRESH10',
          notes: 'Leave at the front desk.',
        },
        { headers },
      ),
    );
    const after = await firstValueFrom(
      http.get<OrderListResponse>('/api/orders?page=1&pageSize=50', { headers }),
    );

    expect(created.data.status).toBe('received');
    expect(created.data.paymentMethod).toBe('paypal');
    expect(created.data.notes).toBe('Leave at the front desk.');
    expect(after.pagination.totalItems).toBe(before.pagination.totalItems + 1);
    expect(after.data[0].id).toBe(created.data.id);
  });

  it('should reject order quantities that exceed current stock', async () => {
    const auth = await firstValueFrom(
      http.post<AuthResponse>('/api/auth/login', {
        email: MOCK_CUSTOMER_EMAIL,
        password: MOCK_CUSTOMER_PASSWORD,
        rememberMe: true,
      }),
    );
    const product = PRODUCTS_FIXTURE[0];
    const request = firstValueFrom(
      http.post(
        '/api/orders',
        {
          items: [{ productId: product.id, quantity: product.inventory.quantity + 1 }],
          billingAddress: checkoutAddress,
          shippingAddress: checkoutAddress,
          paymentMethod: 'cash-on-delivery',
        },
        { headers: { Authorization: `Bearer ${auth.data.accessToken}` } },
      ),
    );

    await expect(request).rejects.toMatchObject({
      status: 409,
      error: { error: { code: 'STOCK_UNAVAILABLE' } },
    });
  });
});
