import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ProductRepository } from '@core/data-access';
import { PRODUCTS_FIXTURE } from '@core/mock-api/fixtures';
import { ShoppingCartStore } from '@core/state';

import { HomeProductSections } from './home-product-sections';

const response = {
  data: PRODUCTS_FIXTURE,
  pagination: { page: 1, pageSize: 100, totalItems: PRODUCTS_FIXTURE.length, totalPages: 1 },
};

describe('HomeProductSections', () => {
  it('renders featured and discounted products from a single catalog request', async () => {
    const getProducts = vi.fn().mockReturnValue(of(response));
    await TestBed.configureTestingModule({
      imports: [HomeProductSections],
      providers: [provideRouter([]), { provide: ProductRepository, useValue: { getProducts } }],
    }).compileComponents();

    const fixture = TestBed.createComponent(HomeProductSections);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(getProducts).toHaveBeenCalledOnce();
    expect(getProducts).toHaveBeenCalledWith({ page: 1, pageSize: 100, sort: 'featured' });
    expect(element.querySelectorAll('.product-grid--featured app-product-card')).toHaveLength(5);
    expect(element.querySelectorAll('.product-grid--promotional app-product-card')).toHaveLength(4);
    expect(element.querySelectorAll('.promotion-card__discount')).toHaveLength(4);
    expect(element.querySelector('.promotion-card__discount')?.textContent).toContain('Save 64%');
  });

  it('links each section to its relevant catalog view', async () => {
    await TestBed.configureTestingModule({
      imports: [HomeProductSections],
      providers: [
        provideRouter([]),
        { provide: ProductRepository, useValue: { getProducts: () => of(response) } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(HomeProductSections);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(
      element.querySelector<HTMLAnchorElement>('.section-header a')?.getAttribute('href'),
    ).toBe('/shop?sort=featured');
    expect(element.querySelector<HTMLAnchorElement>('.promotion__cta')?.getAttribute('href')).toBe(
      '/shop?sale=true',
    );
  });

  it('adds products from storefront cards to the shared cart store', async () => {
    await TestBed.configureTestingModule({
      imports: [HomeProductSections],
      providers: [
        provideRouter([]),
        { provide: ProductRepository, useValue: { getProducts: () => of(response) } },
      ],
    }).compileComponents();
    const shoppingCart = TestBed.inject(ShoppingCartStore);
    shoppingCart.clear();
    const fixture = TestBed.createComponent(HomeProductSections);
    fixture.detectChanges();
    const addButton = fixture.nativeElement.querySelector(
      '.product-grid--featured .product-card__cart',
    ) as HTMLButtonElement;

    addButton.click();

    expect(shoppingCart.itemCount()).toBe(1);
    expect(shoppingCart.lines()[0]?.product).toEqual(PRODUCTS_FIXTURE[0]);
  });

  it('shows a shared failure state when the catalog request fails', async () => {
    await TestBed.configureTestingModule({
      imports: [HomeProductSections],
      providers: [
        provideRouter([]),
        {
          provide: ProductRepository,
          useValue: { getProducts: () => throwError(() => new Error('Request failed')) },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(HomeProductSections);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain(
      'Products are unavailable',
    );
  });
});
