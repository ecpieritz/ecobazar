import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { Button, FeedbackMessage, FormControlField } from '@shared/ui';

@Component({
  selector: 'app-newsletter-signup',
  imports: [Button, FeedbackMessage, FormControlField, ReactiveFormsModule],
  templateUrl: './newsletter-signup.html',
  styleUrl: './newsletter-signup.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsletterSignup {
  protected readonly emailControl = new FormControl('', { nonNullable: true });
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
    this.emailControl.reset();
  }

  protected clearFeedback(): void {
    this.feedback.set(null);
  }
}
