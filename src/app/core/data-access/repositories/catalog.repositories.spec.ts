import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import type {
  CategoryListResponse,
  ProductListResponse,
  ProductResponse,
  ReviewListResponse,
} from '@core/api';
import type { Product, ProductCategory, ProductReview } from '@core/domain';

import { CategoryRepository } from './category.repository';
import { ProductRepository } from './product.repository';
import { ReviewRepository } from './review.repository';

describe('catalog repositories', () => {
  let httpTesting: HttpTestingController;
  let categories: CategoryRepository;
  let products: ProductRepository;
  let reviews: ReviewRepository;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
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

  it('should fetch and unwrap product categories', async () => {
    const category: ProductCategory = {
      id: 'category-vegetables',
      name: 'Vegetables',
      slug: 'vegetables',
      description: 'Fresh vegetables.',
      image: { src: '/vegetables.webp', alt: 'Vegetables' },
      productCount: 10,
    };
    const resultPromise = firstValueFrom(categories.getCategories());
    const request = httpTesting.expectOne('/api/categories');

    expect(request.request.method).toBe('GET');
    request.flush({ data: [category] } satisfies CategoryListResponse);

    await expect(resultPromise).resolves.toEqual([category]);
  });

  it('should serialize product filters without losing repeated tags', async () => {
    const response: ProductListResponse = {
      data: [],
      pagination: { page: 2, pageSize: 6, totalItems: 0, totalPages: 0 },
    };
    const resultPromise = firstValueFrom(
      products.getProducts({
        page: 2,
        pageSize: 6,
        search: 'green apple',
        category: 'fresh-fruit',
        minimumPrice: 5,
        maximumPrice: 20,
        minimumRating: 4,
        tags: ['healthy', 'low-fat'],
        inStock: true,
        sale: true,
        featured: true,
        sort: 'price-ascending',
      }),
    );
    const request = httpTesting.expectOne(
      ({ url }) => url === '/api/products',
      'product collection request',
    );

    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('page')).toBe('2');
    expect(request.request.params.get('pageSize')).toBe('6');
    expect(request.request.params.get('search')).toBe('green apple');
    expect(request.request.params.get('category')).toBe('fresh-fruit');
    expect(request.request.params.get('minimumPrice')).toBe('5');
    expect(request.request.params.get('maximumPrice')).toBe('20');
    expect(request.request.params.get('minimumRating')).toBe('4');
    expect(request.request.params.getAll('tags')).toEqual(['healthy', 'low-fat']);
    expect(request.request.params.get('inStock')).toBe('true');
    expect(request.request.params.get('sale')).toBe('true');
    expect(request.request.params.get('featured')).toBe('true');
    expect(request.request.params.get('sort')).toBe('price-ascending');
    request.flush(response);

    await expect(resultPromise).resolves.toEqual(response);
  });

  it('should fetch a product by its encoded slug and unwrap the response', async () => {
    const product = { id: 'product-green-apple', slug: 'green apple' } as Product;
    const resultPromise = firstValueFrom(products.getProductBySlug('green apple'));
    const request = httpTesting.expectOne('/api/products/green%20apple');

    expect(request.request.method).toBe('GET');
    request.flush({ data: product } satisfies ProductResponse);

    await expect(resultPromise).resolves.toBe(product);
  });

  it('should fetch paginated reviews for an encoded product identifier', async () => {
    const review = { id: 'review-1', productId: 'product/01' } as ProductReview;
    const response: ReviewListResponse = {
      data: [review],
      pagination: { page: 1, pageSize: 3, totalItems: 1, totalPages: 1 },
    };
    const resultPromise = firstValueFrom(
      reviews.getProductReviews({ productId: 'product/01', page: 1, pageSize: 3 }),
    );
    const request = httpTesting.expectOne('/api/products/product%2F01/reviews?page=1&pageSize=3');

    expect(request.request.method).toBe('GET');
    request.flush(response);

    await expect(resultPromise).resolves.toEqual(response);
  });
});
