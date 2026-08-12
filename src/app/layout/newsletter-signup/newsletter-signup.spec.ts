import { TestBed } from '@angular/core/testing';

import { NewsletterSignup } from './newsletter-signup';

describe('NewsletterSignup', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [NewsletterSignup] }).compileComponents();
  });

  it('should render an accessible newsletter form and social links', () => {
    const fixture = TestBed.createComponent(NewsletterSignup);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('form')).toBeTruthy();
    expect(element.querySelector('input[type="email"]')?.hasAttribute('required')).toBe(true);
    expect(element.querySelector('[aria-live="polite"]')).toBeTruthy();
    expect(element.querySelectorAll('.social-links a')).toHaveLength(4);
  });

  it('should acknowledge a valid subscription and reset the email field', () => {
    const fixture = TestBed.createComponent(NewsletterSignup);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const form = element.querySelector('form') as HTMLFormElement;
    const input = element.querySelector('input') as HTMLInputElement;
    input.value = 'customer@example.com';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    form.dispatchEvent(new SubmitEvent('submit', { bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(element.querySelector('[aria-live="polite"]')?.textContent).toContain(
      'Thanks for subscribing',
    );
    expect(input.value).toBe('');
  });
});
