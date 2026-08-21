import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { NotificationStore } from '@core/notifications';

import { AboutPage } from './about-page/about-page';
import { ContactPage } from './contact-page/contact-page';
import { FaqPage } from './faq-page/faq-page';

describe('institutional content pages', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutPage, ContactPage, FaqPage],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should render the about story, team, testimonials, and partners', () => {
    const fixture = TestBed.createComponent(AboutPage);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('h1')?.textContent).toContain('100% trusted organic food store');
    expect(element.querySelectorAll('.about-team article')).toHaveLength(3);
    expect(element.querySelectorAll('blockquote')).toHaveLength(3);
    expect(element.querySelectorAll('.about-partners li').length).toBeGreaterThan(3);
  });

  it('should expose each FAQ through native keyboard-accessible disclosure controls', () => {
    const fixture = TestBed.createComponent(FaqPage);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelectorAll('details')).toHaveLength(8);
    expect(element.querySelectorAll('summary')).toHaveLength(8);
    expect((element.querySelector('details') as HTMLDetailsElement).open).toBe(true);
  });

  it('should validate and complete the mocked contact submission', () => {
    vi.useFakeTimers();
    const fixture = TestBed.createComponent(ContactPage);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const values = {
      name: 'Dianne Russell',
      email: 'demo@ecobazar.com',
      subject: 'Fresh produce',
      message: 'I would like to know more about your seasonal products.',
    };

    for (const [controlName, value] of Object.entries(values)) {
      const control = element.querySelector(`[formcontrolname="${controlName}"]`) as
        HTMLInputElement | HTMLTextAreaElement;
      control.value = value;
      control.dispatchEvent(new Event('input'));
    }
    (element.querySelector('form') as HTMLFormElement).dispatchEvent(new Event('submit'));
    vi.advanceTimersByTime(500);
    fixture.detectChanges();

    expect(element.querySelector('[role="status"]')?.textContent).toContain(
      'Thanks for reaching out',
    );
    expect(TestBed.inject(NotificationStore).notifications()[0]).toMatchObject({
      kind: 'success',
      title: 'Message sent',
    });
    TestBed.inject(NotificationStore).clear();
    vi.useRealTimers();
  });
});
