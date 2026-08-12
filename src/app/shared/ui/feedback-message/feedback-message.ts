import { booleanAttribute, ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export type FeedbackTone = 'info' | 'success' | 'warning' | 'error';

@Component({
  selector: 'app-feedback-message',
  templateUrl: './feedback-message.html',
  styleUrl: './feedback-message.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeedbackMessage {
  readonly message = input<string | null>(null);
  readonly tone = input<FeedbackTone>('info');
  readonly dismissible = input(false, { transform: booleanAttribute });

  readonly dismissed = output<void>();
}
