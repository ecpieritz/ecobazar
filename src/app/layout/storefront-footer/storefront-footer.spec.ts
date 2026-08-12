import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { StorefrontFooter } from './storefront-footer';

describe('StorefrontFooter', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StorefrontFooter],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should render company contact details and navigation groups', () => {
    const fixture = TestBed.createComponent(StorefrontFooter);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('.footer-brand')?.textContent).toContain('Ecobazar');
    expect(element.querySelector('a[href^="tel:"]')).toBeTruthy();
    expect(element.querySelector('a[href^="mailto:"]')).toBeTruthy();
    expect(element.querySelectorAll('.footer-links')).toHaveLength(4);
  });

  it('should render accepted payment methods and the current year', () => {
    const fixture = TestBed.createComponent(StorefrontFooter);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelectorAll('.payment-methods li')).toHaveLength(5);
    expect(element.textContent).toContain(String(new Date().getFullYear()));
  });
});
