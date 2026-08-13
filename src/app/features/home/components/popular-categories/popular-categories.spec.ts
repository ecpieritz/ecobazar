import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { CategoryRepository } from '@core/data-access';
import type { ProductCategory } from '@core/domain';

import { PopularCategories } from './popular-categories';

const categories: readonly ProductCategory[] = [
  {
    id: 'category-fruit',
    slug: 'fresh-fruit',
    name: 'Fresh Fruit',
    description: 'Fresh seasonal fruit.',
    image: { src: '/images/categories/fresh-fruit.jpg', alt: 'Assorted fresh fruit' },
    productCount: 3,
  },
  {
    id: 'category-vegetables',
    slug: 'vegetables',
    name: 'Vegetables',
    description: 'Fresh vegetables.',
    image: { src: '/images/categories/vegetables.jpg', alt: 'Assorted fresh vegetables' },
    productCount: 1,
  },
];

describe('PopularCategories', () => {
  it('renders repository categories with filtered catalog links', async () => {
    await TestBed.configureTestingModule({
      imports: [PopularCategories],
      providers: [
        provideRouter([]),
        { provide: CategoryRepository, useValue: { getCategories: () => of(categories) } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(PopularCategories);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const cards = Array.from(element.querySelectorAll<HTMLAnchorElement>('.category-card'));

    expect(element.querySelector('h2')?.textContent).toContain('Popular Categories');
    expect(cards).toHaveLength(2);
    expect(cards[0].getAttribute('href')).toBe('/shop?category=fresh-fruit');
    expect(cards[0].querySelector('img')?.getAttribute('loading')).toBe('lazy');
    expect(cards[0].textContent).toContain('3 products');
    expect(cards[1].textContent).toContain('1 product');
  });

  it('shows a friendly error when categories cannot be loaded', async () => {
    await TestBed.configureTestingModule({
      imports: [PopularCategories],
      providers: [
        provideRouter([]),
        {
          provide: CategoryRepository,
          useValue: { getCategories: () => throwError(() => new Error('Request failed')) },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(PopularCategories);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain(
      'Categories are unavailable',
    );
  });
});
