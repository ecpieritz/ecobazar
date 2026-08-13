import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Drawer } from './drawer';

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

describe('Drawer', () => {
  let fixture: ComponentFixture<Drawer>;

  beforeAll(installDialogPolyfill);

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Drawer] }).compileComponents();
    fixture = TestBed.createComponent(Drawer);
    fixture.componentRef.setInput('title', 'Shopping cart');
  });

  it('opens with the configured placement and size', () => {
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('placement', 'start');
    fixture.componentRef.setInput('size', 'large');
    fixture.detectChanges();

    const dialog = fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
    expect(dialog.open).toBe(true);
    expect(dialog.classList).toContain('drawer--start');
    expect(dialog.classList).toContain('drawer--large');
    expect(dialog.getAttribute('aria-labelledby')).toBe(
      (fixture.nativeElement.querySelector('h2') as HTMLHeadingElement).id,
    );
  });

  it('closes from a backdrop click and reports the reason', () => {
    const closed = vi.fn();
    fixture.componentInstance.closed.subscribe(closed);
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();

    const dialog = fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
    dialog.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    fixture.detectChanges();

    expect(dialog.open).toBe(false);
    expect(closed).toHaveBeenCalledWith('backdrop');
  });

  it('keeps open when Escape closing is disabled', () => {
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('closeOnEscape', false);
    fixture.detectChanges();

    const dialog = fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
    const event = new Event('cancel', { cancelable: true });
    dialog.dispatchEvent(event);
    fixture.detectChanges();

    expect(event.defaultPrevented).toBe(true);
    expect(dialog.open).toBe(true);
  });
});
