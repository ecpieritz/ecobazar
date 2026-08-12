import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { BreadcrumbBanner } from './breadcrumb-banner';

describe('BreadcrumbBanner', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BreadcrumbBanner],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should render linked ancestors and mark the current page', () => {
    const fixture = TestBed.createComponent(BreadcrumbBanner);
    fixture.componentRef.setInput('items', [
      { label: 'Account', route: '/account' },
      { label: 'Order History', route: '/account/orders' },
      { label: 'Order Detail' },
    ]);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('nav')?.getAttribute('aria-label')).toBe('Breadcrumb');
    expect(element.querySelector('.home-link')?.getAttribute('href')).toBe('/');
    expect(
      [...element.querySelectorAll('.breadcrumb-item a')].map(({ textContent }) => textContent),
    ).toEqual(['Account', 'Order History']);
    expect(element.querySelector('[aria-current="page"]')?.textContent).toBe('Order Detail');
  });

  it('should render a single current-page item without an additional link', () => {
    const fixture = TestBed.createComponent(BreadcrumbBanner);
    fixture.componentRef.setInput('items', [{ label: 'Wishlist' }]);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelectorAll('.breadcrumb-item')).toHaveLength(1);
    expect(element.querySelector('.breadcrumb-item a')).toBeNull();
    expect(element.querySelector('[aria-current="page"]')?.textContent).toBe('Wishlist');
  });
});
