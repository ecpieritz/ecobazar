import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

@Component({
  selector: 'app-newsletter-signup',
  templateUrl: './newsletter-signup.html',
  styleUrl: './newsletter-signup.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsletterSignup {
  protected readonly feedback = signal<string | null>(null);

  protected subscribe(event: SubmitEvent): void {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;

    if (!form.checkValidity()) {
      this.feedback.set(null);
      form.reportValidity();
      return;
    }

    this.feedback.set('Thanks for subscribing! Check your inbox for fresh updates.');
    form.reset();
  }

  protected clearFeedback(): void {
    this.feedback.set(null);
  }
}
