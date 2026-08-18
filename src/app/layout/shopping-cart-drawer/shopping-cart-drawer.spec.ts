import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { PRODUCTS_FIXTURE } from '@core/mock-api/fixtures';
import { ShoppingCartStore } from '@core/state';

import { ShoppingCartDrawer } from './shopping-cart-drawer';

@Component({ template: '' })
class TestPage {}

const installDialogPolyfill = (): void => {
  Object.defineProperties(HTMLDialogElement.prototype, {
    showModal: {
      configurable: true,
      value(this: HTMLDialogElement): void {
        this.open = true;
      },
    },
    close: {
      configurable: true,
      value(this: HTMLDialogElement, returnValue = ''): void {
        this.returnValue = returnValue;
        this.open = false;
        this.dispatchEvent(new Event('close'));
      },
    },
  });
};

describe('ShoppingCartDrawer', () => {
  let shoppingCart: ShoppingCartStore;

  beforeAll(installDialogPolyfill);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShoppingCartDrawer],
      providers: [
        provideRouter([
          { path: 'shop', component: TestPage },
          { path: 'shop/:slug', component: TestPage },
          { path: 'cart', component: TestPage },
          { path: 'checkout', component: TestPage },
        ]),
      ],
    }).compileComponents();
    shoppingCart = TestBed.inject(ShoppingCartStore);
    shoppingCart.clear();
  });

  it('renders cart lines, count, subtotal, and destination links', () => {
    shoppingCart.addProduct(PRODUCTS_FIXTURE[0], 2);
    shoppingCart.addProduct(PRODUCTS_FIXTURE[1]);
    const fixture = TestBed.createComponent(ShoppingCartDrawer);
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const dialog = element.querySelector('dialog') as HTMLDialogElement;

    expect(dialog.open).toBe(true);
    expect(element.querySelector('.drawer__header h2')?.textContent).toContain('Shopping cart (3)');
    expect(element.querySelectorAll('.cart-line')).toHaveLength(2);
    expect(element.querySelector<HTMLAnchorElement>('[href="/checkout"]')).toBeTruthy();
    expect(element.querySelector<HTMLAnchorElement>('[href="/cart"]')).toBeTruthy();
    expect(element.querySelector('.cart-drawer-footer strong')?.textContent).toContain(
      shoppingCart.subtotal().amount.toFixed(2),
    );
  });

  it('removes a product while keeping the drawer open', () => {
    const product = PRODUCTS_FIXTURE[0];
    shoppingCart.addProduct(product);
    const fixture = TestBed.createComponent(ShoppingCartDrawer);
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    (
      element.querySelector(
        `button[aria-label="Remove ${product.name} from cart"]`,
      ) as HTMLButtonElement
    ).click();
    fixture.detectChanges();

    expect(shoppingCart.isEmpty()).toBe(true);
    expect((element.querySelector('dialog') as HTMLDialogElement).open).toBe(true);
    expect(element.querySelector('.empty-cart')?.textContent).toContain('Your cart is empty');
  });

  it('shows an empty state with a route back to the catalog', () => {
    const fixture = TestBed.createComponent(ShoppingCartDrawer);
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('.empty-cart')?.textContent).toContain('Your cart is empty');
    expect(element.querySelector<HTMLAnchorElement>('.empty-cart a')?.getAttribute('href')).toBe(
      '/shop',
    );
    expect(element.querySelector('.cart-drawer-footer')).toBeNull();
  });

  it('closes before navigating to a cart destination', () => {
    shoppingCart.addProduct(PRODUCTS_FIXTURE[0]);
    const fixture = TestBed.createComponent(ShoppingCartDrawer);
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    (element.querySelector('[href="/cart"]') as HTMLAnchorElement).click();
    fixture.detectChanges();

    expect(fixture.componentInstance.open()).toBe(false);
    expect((element.querySelector('dialog') as HTMLDialogElement).open).toBe(false);
  });
});
