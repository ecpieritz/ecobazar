import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';

import { CategoryRepository, ProductRepository } from '@core/data-access';
import { PRODUCT_CATEGORIES_FIXTURE, PRODUCTS_FIXTURE } from '@core/mock-api/fixtures';

import { CatalogPage } from './catalog-page';

describe('CatalogPage', () => {
  const queryParamMap = new BehaviorSubject(
    convertToParamMap({
      category: 'vegetables',
      minimumRating: '4',
      tags: ['healthy'],
      sale: 'true',
      sort: 'price-ascending',
    }),
  );
  const getProducts = vi.fn().mockReturnValue(
    of({
      data: PRODUCTS_FIXTURE.slice(0, 12),
      pagination: { page: 1, pageSize: 12, totalItems: 16, totalPages: 2 },
    }),
  );
  const getFilterOptions = vi.fn().mockReturnValue(
    of({
      priceRange: { minimum: 9, maximum: 32, currency: 'USD' },
      ratings: [{ value: 4, productCount: 12 }],
      tags: [{ value: 'healthy', label: 'Healthy', productCount: 8 }],
    }),
  );

  beforeEach(async () => {
    getProducts.mockClear();
    getFilterOptions.mockClear();
    queryParamMap.next(
      convertToParamMap({
        category: 'vegetables',
        minimumRating: '4',
        tags: ['healthy'],
        sale: 'true',
        sort: 'price-ascending',
      }),
    );

    await TestBed.configureTestingModule({
      imports: [CatalogPage],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { queryParamMap } },
        {
          provide: CategoryRepository,
          useValue: { getCategories: () => of(PRODUCT_CATEGORIES_FIXTURE) },
        },
        { provide: ProductRepository, useValue: { getProducts, getFilterOptions } },
      ],
    }).compileComponents();
  });

  it('loads a paginated product grid from URL filters', () => {
    const fixture = TestBed.createComponent(CatalogPage);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(getProducts).toHaveBeenCalledWith({
      page: 1,
      pageSize: 12,
      category: 'vegetables',
      minimumRating: 4,
      tags: ['healthy'],
      sale: true,
      sort: 'price-ascending',
    });
    expect(getFilterOptions).toHaveBeenCalledOnce();
    expect(element.querySelectorAll('.product-grid app-product-card')).toHaveLength(12);
    expect(element.querySelector('.catalog__toolbar p')?.textContent).toContain('16 results found');
    expect(element.querySelectorAll('.pagination button')).toHaveLength(4);
  });

  it('updates pagination without losing active filters', () => {
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(CatalogPage);
    fixture.detectChanges();
    const nextPage = fixture.nativeElement.querySelector(
      'button[aria-label="Next page"]',
    ) as HTMLButtonElement;

    nextPage.click();

    expect(navigate).toHaveBeenCalledWith([], {
      relativeTo: TestBed.inject(ActivatedRoute),
      queryParams: { page: 2 },
      queryParamsHandling: 'merge',
    });
  });

  it('stores sorting and page size changes in the URL', () => {
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(CatalogPage);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const sort = element.querySelector('.catalog__sort select') as HTMLSelectElement;
    const pageSize = element.querySelector('.catalog__page-size select') as HTMLSelectElement;

    sort.value = 'rating';
    sort.dispatchEvent(new Event('change'));
    pageSize.value = '24';
    pageSize.dispatchEvent(new Event('change'));

    expect(navigate).toHaveBeenNthCalledWith(1, [], {
      relativeTo: TestBed.inject(ActivatedRoute),
      queryParams: { sort: 'rating', page: null },
      queryParamsHandling: 'merge',
    });
    expect(navigate).toHaveBeenNthCalledWith(2, [], {
      relativeTo: TestBed.inject(ActivatedRoute),
      queryParams: { pageSize: 24, page: null },
      queryParamsHandling: 'merge',
    });
  });

  it('uses ellipses for large page ranges while keeping nearby pages accessible', () => {
    queryParamMap.next(convertToParamMap({ page: '10' }));
    getProducts.mockReturnValueOnce(
      of({
        data: PRODUCTS_FIXTURE.slice(0, 12),
        pagination: { page: 10, pageSize: 12, totalItems: 252, totalPages: 21 },
      }),
    );
    const fixture = TestBed.createComponent(CatalogPage);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const pageLabels = [...element.querySelectorAll('.pagination button[aria-label^="Go to page"]')]
      .map((button) => button.getAttribute('aria-label'))
      .filter(Boolean);

    expect(pageLabels).toEqual([
      'Go to page 1',
      'Go to page 9',
      'Go to page 10',
      'Go to page 11',
      'Go to page 21',
    ]);
    expect(element.querySelectorAll('.pagination__ellipsis')).toHaveLength(2);
  });

  it('loads and clears a global search from the URL', () => {
    queryParamMap.next(convertToParamMap({ search: 'green apple' }));
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(CatalogPage);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(getProducts).toHaveBeenCalledWith({
      page: 1,
      pageSize: 12,
      search: 'green apple',
      sort: 'featured',
    });
    expect(element.querySelector('.catalog__search-summary')?.textContent).toContain('green apple');

    (element.querySelector('[aria-label="Clear product search"]') as HTMLButtonElement).click();

    expect(navigate).toHaveBeenCalledWith([], {
      relativeTo: TestBed.inject(ActivatedRoute),
      queryParams: { page: null, search: null },
      queryParamsHandling: 'merge',
    });
  });
});
