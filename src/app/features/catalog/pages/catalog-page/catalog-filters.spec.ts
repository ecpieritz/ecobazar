import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import type { ProductFilterOptions } from '@core/api';
import type { ProductCategory } from '@core/domain';

import type { CatalogFilters } from './catalog-filter.model';
import { CatalogFiltersPanel } from './catalog-filters';

const filters: CatalogFilters = {
  page: 1,
  pageSize: 12,
  search: null,
  category: null,
  minimumPrice: null,
  maximumPrice: null,
  minimumRating: null,
  tags: [],
  inStock: false,
  sale: false,
  featured: false,
  sort: 'featured',
};

const categories: readonly ProductCategory[] = [
  {
    id: 'category-vegetables',
    slug: 'vegetables',
    name: 'Vegetables',
    description: 'Fresh vegetables',
    image: { src: '/vegetables.jpg', alt: 'Vegetables' },
    productCount: 13,
  },
];

const filterOptions: ProductFilterOptions = {
  priceRange: { minimum: 9, maximum: 32, currency: 'USD' },
  ratings: [
    { value: 5, productCount: 3 },
    { value: 4, productCount: 12 },
  ],
  tags: [
    { value: 'healthy', label: 'Healthy', productCount: 8 },
    { value: 'low-fat', label: 'Low Fat', productCount: 4 },
  ],
};

const createComponent = () => {
  const fixture = TestBed.createComponent(CatalogFiltersPanel);
  fixture.componentRef.setInput('categories', categories);
  fixture.componentRef.setInput('filterOptions', filterOptions);
  fixture.componentRef.setInput('filters', filters);
  fixture.detectChanges();
  return fixture;
};

describe('CatalogFiltersPanel', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatalogFiltersPanel],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('renders category, rating, availability, and tag filters', () => {
    const fixture = createComponent();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelectorAll('fieldset')).toHaveLength(3);
    expect(element.querySelector('input[value="vegetables"]')).toBeTruthy();
    expect(element.querySelectorAll('.tag-filter button')).toHaveLength(2);
    expect(element.querySelector('.price-filter__range')?.textContent).toContain('$9–$32');
    expect(element.querySelector('input[name="minimumPrice"]')?.getAttribute('min')).toBe('9');
    expect(element.querySelector('input[value="vegetables"]')?.getAttribute('name')).toBe(
      'category-catalog',
    );
    expect(element.querySelector('.sale-banner')?.getAttribute('href')).toBe('/shop?sale=true');
  });

  it('emits URL-ready filter changes', () => {
    const fixture = createComponent();
    const changed = vi.fn();
    fixture.componentInstance.filtersChanged.subscribe(changed);
    const element = fixture.nativeElement as HTMLElement;

    (element.querySelector('input[value="vegetables"]') as HTMLInputElement).click();
    (element.querySelector('.tag-filter button') as HTMLButtonElement).click();

    expect(changed).toHaveBeenNthCalledWith(1, { category: 'vegetables' });
    expect(changed).toHaveBeenNthCalledWith(2, { tags: ['healthy'] });
  });

  it('normalizes an inverted price range before applying it', () => {
    const fixture = createComponent();
    const changed = vi.fn();
    fixture.componentInstance.filtersChanged.subscribe(changed);
    const element = fixture.nativeElement as HTMLElement;
    const minimum = element.querySelector('input[name="minimumPrice"]') as HTMLInputElement;
    const maximum = element.querySelector('input[name="maximumPrice"]') as HTMLInputElement;
    const form = element.querySelector('.price-filter') as HTMLFormElement;

    minimum.value = '30';
    maximum.value = '10';
    form.dispatchEvent(new SubmitEvent('submit', { bubbles: true, cancelable: true }));

    expect(changed).toHaveBeenCalledWith({ minimumPrice: 10, maximumPrice: 30 });
  });
});
