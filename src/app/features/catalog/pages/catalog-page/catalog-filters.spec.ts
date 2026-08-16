import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import type { ProductCategory } from '@core/domain';

import type { CatalogFilters } from './catalog-filter.model';
import { CatalogFiltersPanel } from './catalog-filters';

const filters: CatalogFilters = {
  page: 1,
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

describe('CatalogFiltersPanel', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatalogFiltersPanel],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('renders category, rating, availability, and tag filters', () => {
    const fixture = TestBed.createComponent(CatalogFiltersPanel);
    fixture.componentRef.setInput('categories', categories);
    fixture.componentRef.setInput('filters', filters);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelectorAll('fieldset')).toHaveLength(3);
    expect(element.querySelector('input[value="vegetables"]')).toBeTruthy();
    expect(element.querySelectorAll('.tag-filter button')).toHaveLength(8);
    expect(element.querySelector('.sale-banner')?.getAttribute('href')).toBe('/shop?sale=true');
  });

  it('emits URL-ready filter changes', () => {
    const fixture = TestBed.createComponent(CatalogFiltersPanel);
    fixture.componentRef.setInput('categories', categories);
    fixture.componentRef.setInput('filters', filters);
    const changed = vi.fn();
    fixture.componentInstance.filtersChanged.subscribe(changed);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    (element.querySelector('input[value="vegetables"]') as HTMLInputElement).click();
    (element.querySelector('.tag-filter button') as HTMLButtonElement).click();

    expect(changed).toHaveBeenNthCalledWith(1, { category: 'vegetables' });
    expect(changed).toHaveBeenNthCalledWith(2, { tags: ['healthy'] });
  });
});
