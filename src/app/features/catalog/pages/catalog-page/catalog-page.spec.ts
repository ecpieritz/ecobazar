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

  beforeEach(async () => {
    getProducts.mockClear();
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
        { provide: ProductRepository, useValue: { getProducts } },
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
});
