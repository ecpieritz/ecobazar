import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  input,
  model,
  output,
  viewChild,
} from '@angular/core';

export type OverlayCloseReason = 'backdrop' | 'close-button' | 'escape' | 'programmatic';
export type ModalVariant = 'default' | 'promotion';

let nextModalId = 0;

@Component({
  selector: 'app-modal',
  templateUrl: './modal.html',
  styleUrl: './modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Modal {
  readonly title = input.required<string>();
  readonly description = input<string | null>(null);
  readonly closeLabel = input('Close dialog');
  readonly closeOnBackdrop = input(true, { transform: booleanAttribute });
  readonly closeOnEscape = input(true, { transform: booleanAttribute });
  readonly variant = input<ModalVariant>('default');
  readonly open = model(false);

  readonly closed = output<OverlayCloseReason>();

  protected readonly titleId = `modal-title-${nextModalId}`;
  protected readonly descriptionId = `modal-description-${nextModalId++}`;
  protected readonly dialog = viewChild<ElementRef<HTMLDialogElement>>('dialog');

  private closeReason: OverlayCloseReason = 'programmatic';
  private previouslyFocused: HTMLElement | null = null;

  constructor() {
    effect(() => {
      const dialog = this.dialog()?.nativeElement;

      if (!dialog) {
        return;
      }

      if (this.open() && !dialog.open) {
        this.previouslyFocused = dialog.ownerDocument.activeElement as HTMLElement | null;
        this.closeReason = 'programmatic';
        dialog.showModal();
      } else if (!this.open() && dialog.open) {
        dialog.close(this.closeReason);
      }
    });
  }

  protected handleBackdrop(event: Event): void {
    if (event.target === event.currentTarget && this.closeOnBackdrop()) {
      this.requestClose('backdrop');
    }
  }

  protected handleCancel(event: Event): void {
    event.preventDefault();

    if (this.closeOnEscape()) {
      this.requestClose('escape');
    }
  }

  protected requestClose(reason: OverlayCloseReason): void {
    this.closeReason = reason;
    this.open.set(false);
  }

  protected handleNativeClose(): void {
    this.open.set(false);
    this.closed.emit(this.closeReason);
    this.previouslyFocused?.focus();
    this.previouslyFocused = null;
    this.closeReason = 'programmatic';
  }
}
