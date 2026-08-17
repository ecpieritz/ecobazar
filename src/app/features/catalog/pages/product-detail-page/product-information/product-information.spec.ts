import { TestBed } from '@angular/core/testing';

import { PRODUCT_REVIEWS_FIXTURE, PRODUCTS_FIXTURE } from '@core/mock-api/fixtures';

import { ProductInformation } from './product-information';

describe('ProductInformation', () => {
  const product = PRODUCTS_FIXTURE.find(({ slug }) => slug === 'chinese-cabbage')!;
  const reviews = PRODUCT_REVIEWS_FIXTURE.filter(({ productId }) => productId === product.id);

  it('switches between description, attributes, and customer feedback', () => {
    const fixture = TestBed.createComponent(ProductInformation);
    fixture.componentRef.setInput('product', product);
    fixture.componentRef.setInput('categoryName', 'Vegetables');
    fixture.componentRef.setInput('reviews', reviews);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const detailsTab = element.querySelector('#details-tab') as HTMLButtonElement;

    expect(element.querySelector('#description-panel')?.textContent).toContain(product.description);

    detailsTab.click();
    fixture.detectChanges();
    expect(detailsTab.getAttribute('aria-selected')).toBe('true');
    expect(element.querySelector('#details-panel')?.textContent).toContain(product.sku);

    (element.querySelector('#reviews-tab') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(element.querySelectorAll('.review')).toHaveLength(reviews.length);
  });
});
