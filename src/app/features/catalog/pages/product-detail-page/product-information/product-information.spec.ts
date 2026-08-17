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
    fixture.componentInstance.tabChanged.subscribe((tab) => {
      fixture.componentRef.setInput('activeTab', tab);
    });
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
    expect(element.querySelectorAll('.review')).toHaveLength(3);
    expect(element.querySelector('.information__load-more')).not.toBeNull();

    (element.querySelector('.information__load-more button') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(element.querySelectorAll('.review')).toHaveLength(reviews.length);
    expect(element.querySelector('.information__load-more')).toBeNull();
  });

  it('supports arrow, Home, and End keys with roving tab focus', () => {
    const fixture = TestBed.createComponent(ProductInformation);
    fixture.componentRef.setInput('product', product);
    fixture.componentRef.setInput('categoryName', 'Vegetables');
    fixture.componentRef.setInput('reviews', reviews);
    fixture.componentInstance.tabChanged.subscribe((tab) => {
      fixture.componentRef.setInput('activeTab', tab);
    });
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const descriptionTab = element.querySelector('#description-tab') as HTMLButtonElement;

    descriptionTab.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    fixture.detectChanges();

    const reviewsTab = element.querySelector('#reviews-tab') as HTMLButtonElement;
    expect(reviewsTab.getAttribute('aria-selected')).toBe('true');
    expect(reviewsTab.getAttribute('tabindex')).toBe('0');
    expect(document.activeElement).toBe(reviewsTab);

    reviewsTab.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    fixture.detectChanges();
    expect(descriptionTab.getAttribute('aria-selected')).toBe('true');
  });
});
