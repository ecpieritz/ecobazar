import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { PRODUCTS_FIXTURE } from '@core/mock-api/fixtures';

import { RelatedProducts } from './related-products';

describe('RelatedProducts', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RelatedProducts],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('renders a responsive recommendation grid', () => {
    const fixture = TestBed.createComponent(RelatedProducts);
    fixture.componentRef.setInput('products', PRODUCTS_FIXTURE.slice(0, 4));
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelectorAll('app-product-card')).toHaveLength(4);
    expect(element.querySelector('h2')?.textContent).toContain('Related products');
  });

  it('does not render an empty recommendation section', () => {
    const fixture = TestBed.createComponent(RelatedProducts);
    fixture.componentRef.setInput('products', []);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('section')).toBeNull();
  });
});
