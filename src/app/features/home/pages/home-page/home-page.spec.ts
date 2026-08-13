import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { CategoryRepository, ProductRepository } from '@core/data-access';
import { LOCAL_STORAGE } from '@core/persistence';

import { HomePage } from './home-page';

describe('HomePage', () => {
  it('composes the complete storefront home experience', async () => {
    await TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [
        provideRouter([]),
        { provide: CategoryRepository, useValue: { getCategories: () => of([]) } },
        {
          provide: LOCAL_STORAGE,
          useValue: {
            getItem: () => 'true',
            setItem: vi.fn(),
          },
        },
        {
          provide: ProductRepository,
          useValue: {
            getProducts: () =>
              of({
                data: [],
                pagination: { page: 1, pageSize: 100, totalItems: 0, totalPages: 0 },
              }),
          },
        },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-hero-banners')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-store-benefits')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-popular-categories')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-home-product-sections')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-home-content-sections')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-newsletter-promotion-modal')).toBeTruthy();
  });
});
