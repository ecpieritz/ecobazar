import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { PRODUCTS_FIXTURE } from '@core/mock-api/fixtures';

import { ProductCard } from './product-card';

describe('ProductCard', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductCard],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('renders product information and detail links', () => {
    const fixture = TestBed.createComponent(ProductCard);
    const product = PRODUCTS_FIXTURE[0];
    fixture.componentRef.setInput('product', product);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('h3')?.textContent).toContain(product.name);
    expect(element.querySelector('img')?.getAttribute('alt')).toBe(product.images[0]?.alt);
    expect(element.querySelector('.product-card__price')?.textContent).toContain('$14.99');
    expect(element.querySelector('s')?.textContent).toContain('$20.99');
    expect(element.querySelector('app-rating')).toBeTruthy();
    expect(element.querySelectorAll('a')[1]?.getAttribute('href')).toBe('/shop/green-apple');
  });

  it('emits product actions', () => {
    const fixture = TestBed.createComponent(ProductCard);
    const product = PRODUCTS_FIXTURE[0];
    const addToCart = vi.fn();
    const toggleWishlist = vi.fn();
    const quickView = vi.fn();
    fixture.componentInstance.addToCart.subscribe(addToCart);
    fixture.componentInstance.toggleWishlist.subscribe(toggleWishlist);
    fixture.componentInstance.quickView.subscribe(quickView);
    fixture.componentRef.setInput('product', product);
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll(
      'button',
    ) as NodeListOf<HTMLButtonElement>;
    buttons[0]?.click();
    buttons[1]?.click();
    buttons[2]?.click();

    expect(toggleWishlist).toHaveBeenCalledWith(product);
    expect(quickView).toHaveBeenCalledWith(product);
    expect(addToCart).toHaveBeenCalledWith(product);
  });

  it('disables cart actions for an out-of-stock product', () => {
    const fixture = TestBed.createComponent(ProductCard);
    const product = PRODUCTS_FIXTURE.find(({ inventory }) => inventory.status === 'out-of-stock');
    expect(product).toBeDefined();
    fixture.componentRef.setInput('product', product);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const cartButton = element.querySelector('.product-card__cart') as HTMLButtonElement;
    expect(element.querySelector('.product-card__stock')?.textContent).toContain('Out of stock');
    expect(cartButton.disabled).toBe(true);
  });
});
