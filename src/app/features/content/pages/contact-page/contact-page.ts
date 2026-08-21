import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { timer } from 'rxjs';

import { NotificationStore } from '@core/notifications';

@Component({
  selector: 'app-contact-page',
  imports: [ReactiveFormsModule],
  templateUrl: './contact-page.html',
  styleUrl: './contact-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly notifications = inject(NotificationStore);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly pending = signal(false);
  protected readonly feedback = signal<{ kind: 'success' | 'error'; message: string } | null>(null);
  protected readonly form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    subject: ['', [Validators.required, Validators.minLength(3)]],
    message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
  });

  protected submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.pending()) return;
    this.pending.set(true);
    this.feedback.set(null);
    const shouldFail = this.form.controls.email.value.endsWith('@fail.test');

    timer(500)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.pending.set(false);
        if (shouldFail) {
          const message = 'The simulated service could not send your message. Please try again.';
          this.feedback.set({ kind: 'error', message });
          this.notifications.error(message, 'Message not sent');
          return;
        }
        const message = 'Thanks for reaching out. We will get back to you soon.';
        this.feedback.set({ kind: 'success', message });
        this.notifications.success(message, 'Message sent');
        this.form.reset();
      });
  }
}
