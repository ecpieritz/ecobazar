import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { createPersistenceKey, LocalStorageService } from '@core/persistence';
import { Button, FeedbackMessage, FormControlField, Modal } from '@shared/ui';

const NEWSLETTER_PROMOTION_DISMISSED = createPersistenceKey<boolean>(
  'newsletter-promotion-dismissed',
);

@Component({
  selector: 'app-newsletter-promotion-modal',
  imports: [Button, FeedbackMessage, FormControlField, Modal, ReactiveFormsModule],
  templateUrl: './newsletter-promotion-modal.html',
  styleUrl: './newsletter-promotion-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsletterPromotionModal {
  private readonly localStorage = inject(LocalStorageService);

  protected readonly emailControl = new FormControl('', { nonNullable: true });
  protected readonly feedback = signal<string | null>(null);
  protected readonly doNotShowAgain = signal(false);
  protected readonly open = signal(this.localStorage.get(NEWSLETTER_PROMOTION_DISMISSED) !== true);

  protected subscribe(event: SubmitEvent): void {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;

    if (!form.checkValidity()) {
      this.feedback.set(null);
      form.reportValidity();
      return;
    }

    this.localStorage.set(NEWSLETTER_PROMOTION_DISMISSED, true);
    this.feedback.set('Thanks for subscribing! Your 20% discount is ready for your inbox.');
    this.emailControl.reset();
  }

  protected updatePreference(event: Event): void {
    this.doNotShowAgain.set((event.target as HTMLInputElement).checked);
  }

  protected handleClosed(): void {
    if (this.doNotShowAgain()) {
      this.localStorage.set(NEWSLETTER_PROMOTION_DISMISSED, true);
    }
  }

  protected clearFeedback(): void {
    this.feedback.set(null);
  }
}
