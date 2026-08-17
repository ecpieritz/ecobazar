import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';

import { CategoryRepository, ProductRepository, ReviewRepository } from '@core/data-access';
import {
  PRODUCT_CATEGORIES_FIXTURE,
  PRODUCT_REVIEWS_FIXTURE,
  PRODUCTS_FIXTURE,
} from '@core/mock-api/fixtures';

import { ProductDetailPage } from './product-detail-page';

describe('ProductDetailPage', () => {
  const product = PRODUCTS_FIXTURE.find(({ slug }) => slug === 'chinese-cabbage')!;
  const relatedProducts = PRODUCTS_FIXTURE.filter(
    ({ categoryId }) => categoryId === product.categoryId,
  ).slice(0, 5);
  const reviews = PRODUCT_REVIEWS_FIXTURE.filter(({ productId }) => productId === product.id);
  const paramMap = new BehaviorSubject(convertToParamMap({ slug: product.slug }));
  const getProductBySlug = vi.fn();
  const getProducts = vi.fn();
  const getProductReviews = vi.fn();

  beforeEach(async () => {
    paramMap.next(convertToParamMap({ slug: product.slug }));
    getProductBySlug.mockReset().mockReturnValue(of(product));
    getProducts.mockReset().mockReturnValue(
      of({
        data: relatedProducts,
        pagination: { page: 1, pageSize: 5, totalItems: relatedProducts.length, totalPages: 1 },
      }),
    );
    getProductReviews.mockReset().mockReturnValue(
      of({
        data: reviews,
        pagination: { page: 1, pageSize: 10, totalItems: reviews.length, totalPages: 1 },
      }),
    );

    await TestBed.configureTestingModule({
      imports: [ProductDetailPage],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { paramMap } },
        {
          provide: ProductRepository,
          useValue: { getProductBySlug, getProducts },
        },
        {
          provide: CategoryRepository,
          useValue: { getCategories: () => of(PRODUCT_CATEGORIES_FIXTURE) },
        },
        { provide: ReviewRepository, useValue: { getProductReviews } },
      ],
    }).compileComponents();
  });

  it('loads product data from the route and renders related products', () => {
    const fixture = TestBed.createComponent(ProductDetailPage);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(getProductBySlug).toHaveBeenCalledWith('chinese-cabbage');
    expect(getProducts).toHaveBeenCalledWith({
      category: product.categoryId,
      page: 1,
      pageSize: 5,
      sort: 'featured',
    });
    expect(getProductReviews).toHaveBeenCalledWith({
      productId: product.id,
      page: 1,
      pageSize: 10,
    });
    expect(element.querySelector('h1')?.textContent).toContain(product.name);
    expect(element.querySelectorAll('.product-detail__grid app-product-card')).toHaveLength(4);
    expect(TestBed.inject(Title).getTitle()).toBe(`${product.name} | Ecobazar`);
  });

  it('shows an error state when the product cannot be loaded', () => {
    getProductBySlug.mockReturnValueOnce(throwError(() => new Error('Product not found')));
    const fixture = TestBed.createComponent(ProductDetailPage);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('[role="alert"]')?.textContent).toContain(
      'We could not find this product',
    );
    expect(element.querySelector('a[href="/shop"]')?.textContent).toContain('Return to the shop');
  });

  it('acknowledges a quantity selected for the demo cart', () => {
    const fixture = TestBed.createComponent(ProductDetailPage);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const increaseButton = element.querySelector(
      'button[aria-label="Increase quantity"]',
    ) as HTMLButtonElement;
    const addButton = element.querySelector('.summary__add button') as HTMLButtonElement;

    increaseButton.click();
    addButton.click();
    fixture.detectChanges();

    expect(element.querySelector('[role="status"]')?.textContent).toContain(
      `2 items of ${product.name} added`,
    );
  });
});
