import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { mockApiInterceptor } from '@core/mock-api';

import { CategoryRepository } from './category.repository';
import { ProductRepository } from './product.repository';
import { ReviewRepository } from './review.repository';

describe('catalog repositories with mock API', () => {
  let httpTesting: HttpTestingController;
  let categories: CategoryRepository;
  let products: ProductRepository;
  let reviews: ReviewRepository;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([mockApiInterceptor])),
        provideHttpClientTesting(),
        CategoryRepository,
        ProductRepository,
        ReviewRepository,
      ],
    });

    httpTesting = TestBed.inject(HttpTestingController);
    categories = TestBed.inject(CategoryRepository);
    products = TestBed.inject(ProductRepository);
    reviews = TestBed.inject(ReviewRepository);
  });

  afterEach(() => httpTesting.verify());

  it('should expose the complete category fixture through the repository', async () => {
    const result = await firstValueFrom(categories.getCategories());

    expect(result).toHaveLength(7);
    expect(result.map(({ slug }) => slug)).toContain('vegetables');
    expect(result.reduce((total, category) => total + category.productCount, 0)).toBe(16);
  });

  it('should apply repository filters against mocked products', async () => {
    const result = await firstValueFrom(
      products.getProducts({
        category: 'vegetables',
        tags: ['healthy', 'low-fat'],
        inStock: true,
        sort: 'price-descending',
        pageSize: 10,
      }),
    );

    expect(result.data.length).toBeGreaterThan(0);
    expect(result.pagination.totalItems).toBe(result.data.length);
    expect(result.data.every(({ inventory }) => inventory.quantity > 0)).toBe(true);
    expect(
      result.data.every(({ tags }) => tags.includes('healthy') && tags.includes('low-fat')),
    ).toBe(true);
    expect(result.data.map(({ price }) => price.amount)).toEqual(
      [...result.data].map(({ price }) => price.amount).sort((first, second) => second - first),
    );
  });

  it('should resolve product details and their reviews through the full data path', async () => {
    const product = await firstValueFrom(products.getProductBySlug('chinese-cabbage'));
    const result = await firstValueFrom(
      reviews.getProductReviews({ productId: product.id, page: 1, pageSize: 2 }),
    );

    expect(product.name).toBe('Chinese Cabbage');
    expect(product.images).toHaveLength(4);
    expect(result.data).toHaveLength(2);
    expect(result.pagination.totalItems).toBe(product.rating.count);
    expect(result.data.every(({ productId }) => productId === product.id)).toBe(true);
  });

  it('should propagate typed mock API errors to repository consumers', async () => {
    const missingProduct = firstValueFrom(products.getProductBySlug('missing-product'));
    const invalidPage = firstValueFrom(products.getProducts({ page: 0 }));

    await expect(missingProduct).rejects.toMatchObject({
      status: 404,
      error: { error: { code: 'PRODUCT_NOT_FOUND' } },
    });
    await expect(invalidPage).rejects.toMatchObject({
      status: 400,
      error: { error: { code: 'INVALID_QUERY' } },
    });
  });
});
