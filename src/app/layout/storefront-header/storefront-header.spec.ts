import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

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
    const navigation = fixture.debugElement.query(By.css('.navigation-bar__content'));

    expect(toggle.attributes['aria-expanded']).toBe('false');
    expect(navigation.classes['is-open']).toBeFalsy();

    toggle.triggerEventHandler('click');
    fixture.detectChanges();

    expect(toggle.attributes['aria-expanded']).toBe('true');
    expect(navigation.classes['is-open']).toBe(true);

    fixture.debugElement
      .query(By.css('.primary-navigation a'))
      .triggerEventHandler('click', new MouseEvent('click', { button: 0 }));
    fixture.detectChanges();

    expect(toggle.attributes['aria-expanded']).toBe('false');
    expect(navigation.classes['is-open']).toBeFalsy();
  });
});
