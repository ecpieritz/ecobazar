import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedbackMessage } from './feedback-message';

describe('FeedbackMessage', () => {
  let fixture: ComponentFixture<FeedbackMessage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [FeedbackMessage] }).compileComponents();
    fixture = TestBed.createComponent(FeedbackMessage);
  });

  it('uses an assertive alert for errors', () => {
    fixture.componentRef.setInput('message', 'Unable to save your changes.');
    fixture.componentRef.setInput('tone', 'error');
    fixture.detectChanges();

    const feedback = fixture.nativeElement.querySelector('.feedback') as HTMLElement;
    expect(feedback.getAttribute('role')).toBe('alert');
    expect(feedback.getAttribute('aria-live')).toBe('assertive');
  });

  it('emits dismissed from a dismissible message', () => {
    const dismissed = vi.fn();
    fixture.componentInstance.dismissed.subscribe(dismissed);
    fixture.componentRef.setInput('message', 'The cart was updated.');
    fixture.componentRef.setInput('dismissible', true);
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('button') as HTMLButtonElement).click();
    expect(dismissed).toHaveBeenCalledOnce();
  });

  it('keeps an empty polite live region ready for updates', () => {
    fixture.detectChanges();
    const feedback = fixture.nativeElement.querySelector('.feedback') as HTMLElement;
    expect(feedback.getAttribute('role')).toBe('status');
    expect(feedback.getAttribute('aria-live')).toBe('polite');
    expect(feedback.classList).toContain('feedback--empty');
  });
});
