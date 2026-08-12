import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Button } from './button';

describe('Button', () => {
  let fixture: ComponentFixture<Button>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Button] }).compileComponents();
    fixture = TestBed.createComponent(Button);
  });

  it('renders the configured variant and size', () => {
    fixture.componentRef.setInput('variant', 'secondary');
    fixture.componentRef.setInput('size', 'large');
    fixture.componentRef.setInput('fullWidth', true);
    fixture.componentRef.setInput('accessibleLabel', 'Add product');
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.classList).toContain('button--secondary');
    expect(button.classList).toContain('button--large');
    expect(fixture.nativeElement.classList).toContain('button-host--full-width');
    expect(button.getAttribute('aria-label')).toBe('Add product');
  });

  it('disables the native button while loading', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(fixture.nativeElement.querySelector('.button__spinner')).toBeTruthy();
  });

  it('emits pressed when activated', () => {
    const pressed = vi.fn();
    fixture.componentInstance.pressed.subscribe(pressed);
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('button') as HTMLButtonElement).click();
    expect(pressed).toHaveBeenCalledOnce();
  });
});
