import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Modal } from './modal';

const installDialogPolyfill = (): void => {
  Object.defineProperties(HTMLDialogElement.prototype, {
    showModal: {
      configurable: true,
      value(this: HTMLDialogElement): void {
        this.open = true;
      },
    },
    close: {
      configurable: true,
      value(this: HTMLDialogElement, returnValue = ''): void {
        this.returnValue = returnValue;
        this.open = false;
        this.dispatchEvent(new Event('close'));
      },
    },
  });
};

describe('Modal', () => {
  let fixture: ComponentFixture<Modal>;

  beforeAll(installDialogPolyfill);

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Modal] }).compileComponents();
    fixture = TestBed.createComponent(Modal);
    fixture.componentRef.setInput('title', 'Confirm order');
  });

  it('opens as a labelled native modal dialog', () => {
    fixture.componentRef.setInput('description', 'Review your order before continuing.');
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    const dialog = fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
    const title = fixture.nativeElement.querySelector('h2') as HTMLHeadingElement;
    const description = fixture.nativeElement.querySelector('p') as HTMLParagraphElement;
    expect(dialog.open).toBe(true);
    expect(dialog.getAttribute('aria-labelledby')).toBe(title.id);
    expect(dialog.getAttribute('aria-describedby')).toBe(description.id);
  });

  it('supports the promotion presentation without changing dialog semantics', () => {
    fixture.componentRef.setInput('variant', 'promotion');
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    const dialog = fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
    const panel = fixture.nativeElement.querySelector('.modal__panel') as HTMLElement;

    expect(dialog.getAttribute('aria-labelledby')).toBeTruthy();
    expect(panel.classList.contains('modal__panel--promotion')).toBe(true);
  });

  it('supports the expanded quick view presentation', () => {
    fixture.componentRef.setInput('variant', 'quick-view');
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    const panel = fixture.nativeElement.querySelector('.modal__panel') as HTMLElement;

    expect(panel.classList.contains('modal__panel--quick-view')).toBe(true);
  });

  it('closes from Escape and reports the reason', () => {
    const closed = vi.fn();
    fixture.componentInstance.closed.subscribe(closed);
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    const dialog = fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
    const event = new Event('cancel', { cancelable: true });
    dialog.dispatchEvent(event);
    fixture.detectChanges();

    expect(event.defaultPrevented).toBe(true);
    expect(dialog.open).toBe(false);
    expect(closed).toHaveBeenCalledWith('escape');
  });

  it('can require an explicit action instead of closing from the backdrop', () => {
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('closeOnBackdrop', false);
    fixture.detectChanges();

    const dialog = fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
    dialog.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    fixture.detectChanges();

    expect(dialog.open).toBe(true);
  });

  it('restores focus after using the close button', () => {
    const trigger = document.createElement('button');
    document.body.append(trigger);
    trigger.focus();
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('.modal__header button') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(document.activeElement).toBe(trigger);
    trigger.remove();
  });
});
