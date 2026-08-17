import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';

import type {
  CategoryListResponse,
  ProductFilterOptionsResponse,
  ProductListResponse,
  ProductResponse,
  ReviewListResponse,
} from '@core/api';

import { mockApiInterceptor } from './mock-api.interceptor';

describe('mockApiInterceptor', () => {
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
});
