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

import type { OverlayCloseReason } from '../modal/modal';

export type DrawerPlacement = 'start' | 'end';
export type DrawerSize = 'small' | 'medium' | 'large';

let nextDrawerId = 0;

@Component({
  selector: 'app-drawer',
  templateUrl: './drawer.html',
  styleUrl: './drawer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Drawer {
  readonly title = input.required<string>();
  readonly description = input<string | null>(null);
  readonly placement = input<DrawerPlacement>('end');
  readonly size = input<DrawerSize>('medium');
  readonly closeLabel = input('Close drawer');
  readonly closeOnBackdrop = input(true, { transform: booleanAttribute });
  readonly closeOnEscape = input(true, { transform: booleanAttribute });
  readonly open = model(false);

  readonly closed = output<OverlayCloseReason>();

  protected readonly titleId = `drawer-title-${nextDrawerId}`;
  protected readonly descriptionId = `drawer-description-${nextDrawerId++}`;
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
