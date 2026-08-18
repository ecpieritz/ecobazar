import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { PRODUCTS_FIXTURE } from '@core/mock-api/fixtures';

import { ProductQuickViewModal } from './product-quick-view-modal';

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

describe('ProductQuickViewModal', () => {
  const product = PRODUCTS_FIXTURE.find(({ slug }) => slug === 'chinese-cabbage')!;

  beforeAll(installDialogPolyfill);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductQuickViewModal],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('presents product purchase details in an accessible modal', () => {
    const fixture = TestBed.createComponent(ProductQuickViewModal);
    fixture.componentRef.setInput('product', product);
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const dialog = element.querySelector('dialog') as HTMLDialogElement;
    const fullDetailsLink = element.querySelector<HTMLAnchorElement>('.quick-view__details-link');

    expect(dialog.open).toBe(true);
    expect(dialog.getAttribute('aria-labelledby')).toBeTruthy();
    expect(element.querySelector('.summary__title-row')?.textContent).toContain(product.name);
    expect(element.querySelector('app-product-gallery')).toBeTruthy();
    expect(fullDetailsLink?.getAttribute('href')).toBe(`/shop/${product.slug}`);
  });

  it('shows feedback after adding the selected quantity to the demo cart', () => {
    const fixture = TestBed.createComponent(ProductQuickViewModal);
    fixture.componentRef.setInput('product', product);
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    (element.querySelector('button[aria-label="Increase quantity"]') as HTMLButtonElement).click();
    (element.querySelector('.summary__add button') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(element.querySelector('app-feedback-message')?.textContent).toContain(
      `2 items of ${product.name} added to your demo cart.`,
    );
  });

  it('resets product-specific controls when previewing another product', () => {
    const fixture = TestBed.createComponent(ProductQuickViewModal);
    fixture.componentRef.setInput('product', product);
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    (element.querySelector('button[aria-label="Increase quantity"]') as HTMLButtonElement).click();
    fixture.componentRef.setInput('product', PRODUCTS_FIXTURE[0]);
    fixture.detectChanges();

    expect((element.querySelector('input[aria-label="Quantity"]') as HTMLInputElement).value).toBe(
      '1',
    );
  });
});
