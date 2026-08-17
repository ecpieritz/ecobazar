import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { PRODUCTS_FIXTURE } from '@core/mock-api/fixtures';

import { ProductSummary } from './product-summary';

describe('ProductSummary', () => {
  const product = PRODUCTS_FIXTURE.find(({ slug }) => slug === 'chinese-cabbage')!;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductSummary],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('emits the selected quantity when adding a product', () => {
    const fixture = TestBed.createComponent(ProductSummary);
    fixture.componentRef.setInput('product', product);
    fixture.componentRef.setInput('categoryName', 'Vegetables');
    fixture.componentRef.setInput('categorySlug', 'vegetables');
    const emitted = vi.fn();
    fixture.componentInstance.addRequested.subscribe(emitted);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    (element.querySelector('button[aria-label="Increase quantity"]') as HTMLButtonElement).click();
    (element.querySelector('.summary__add button') as HTMLButtonElement).click();

    expect(emitted).toHaveBeenCalledWith({ product, quantity: 2 });
  });

  it('disables purchasing controls for an unavailable product', () => {
    const unavailable = PRODUCTS_FIXTURE.find(({ slug }) => slug === 'sweet-corn')!;
    const fixture = TestBed.createComponent(ProductSummary);
    fixture.componentRef.setInput('product', unavailable);
    fixture.componentRef.setInput('categoryName', 'Vegetables');
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect((element.querySelector('.summary__add button') as HTMLButtonElement).disabled).toBe(
      true,
    );
    expect(element.querySelector('.summary__stock')?.textContent).toContain('Out of stock');
  });
});
