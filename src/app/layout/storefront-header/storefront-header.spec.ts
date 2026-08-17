import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';

import { StorefrontHeader } from './storefront-header';

describe('StorefrontHeader', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StorefrontHeader],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should render the storefront identity and primary actions', () => {
    const fixture = TestBed.createComponent(StorefrontHeader);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('.brand')?.textContent).toContain('Ecobazar');
    expect(element.querySelector('[aria-label="Wishlist"]')).toBeTruthy();
    expect(element.querySelector('[aria-label^="Shopping cart"]')).toBeTruthy();
    expect(element.querySelector('nav[aria-label="Primary navigation"]')).toBeTruthy();
    expect(element.querySelectorAll('form[role="search"]')).toHaveLength(2);
  });

  it('should toggle and close the responsive navigation', () => {
    const fixture = TestBed.createComponent(StorefrontHeader);
    fixture.detectChanges();
    const toggle = fixture.debugElement.query(By.css('.menu-toggle'));
    const navigation = fixture.debugElement.query(By.css('.navigation-bar'));

    expect(toggle.attributes['aria-expanded']).toBe('false');
    expect(navigation.classes['is-open']).toBeFalsy();

    toggle.triggerEventHandler('click');
    fixture.detectChanges();

    expect(toggle.attributes['aria-expanded']).toBe('true');
    expect(navigation.classes['is-open']).toBe(true);
    expect(document.body.style.overflow).toBe('hidden');

    fixture.debugElement
      .query(By.css('.primary-navigation a'))
      .triggerEventHandler('click', new MouseEvent('click', { button: 0 }));
    fixture.detectChanges();

    expect(toggle.attributes['aria-expanded']).toBe('false');
    expect(navigation.classes['is-open']).toBeFalsy();
    expect(document.body.style.overflow).toBe('');
  });

  it('should dismiss the mobile navigation from its backdrop', () => {
    const fixture = TestBed.createComponent(StorefrontHeader);
    fixture.detectChanges();
    const toggle = fixture.debugElement.query(By.css('.menu-toggle'));

    toggle.triggerEventHandler('click');
    fixture.detectChanges();
    fixture.debugElement.query(By.css('.navigation-backdrop')).triggerEventHandler('click');
    fixture.detectChanges();

    expect(toggle.attributes['aria-expanded']).toBe('false');
  });

  it('should close the mobile navigation when Escape is pressed', () => {
    const fixture = TestBed.createComponent(StorefrontHeader);
    fixture.detectChanges();
    const toggle = fixture.debugElement.query(By.css('.menu-toggle'));

    toggle.triggerEventHandler('click');
    fixture.detectChanges();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    expect(toggle.attributes['aria-expanded']).toBe('false');
    expect(document.body.style.overflow).toBe('');
  });

  it('should close the mobile navigation when entering the desktop breakpoint', () => {
    const fixture = TestBed.createComponent(StorefrontHeader);
    fixture.detectChanges();
    const toggle = fixture.debugElement.query(By.css('.menu-toggle'));
    const originalWidth = window.innerWidth;

    toggle.triggerEventHandler('click');
    fixture.detectChanges();
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1200 });
    window.dispatchEvent(new Event('resize'));
    fixture.detectChanges();

    expect(toggle.attributes['aria-expanded']).toBe('false');
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: originalWidth });
  });

  it('should navigate desktop searches to the filtered product catalog', () => {
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(StorefrontHeader);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const search = element.querySelector('.search--desktop input') as HTMLInputElement;
    const form = element.querySelector('.search--desktop form') as HTMLFormElement;

    search.value = 'green apple';
    search.dispatchEvent(new Event('input'));
    form.dispatchEvent(new SubmitEvent('submit', { bubbles: true, cancelable: true }));

    expect(navigate).toHaveBeenCalledWith(['/shop'], {
      queryParams: { search: 'green apple' },
    });
  });
});
