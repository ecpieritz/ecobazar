import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormControlField } from './form-control';

describe('FormControl', () => {
  let fixture: ComponentFixture<FormControlField>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [FormControlField] }).compileComponents();
    fixture = TestBed.createComponent(FormControlField);
    fixture.componentRef.setInput('label', 'Email address');
  });

  it('connects its label, hint and input accessibly', () => {
    fixture.componentRef.setInput('id', 'customer-email');
    fixture.componentRef.setInput('hint', 'We will never share your email.');
    fixture.detectChanges();

    const label = fixture.nativeElement.querySelector('label') as HTMLLabelElement;
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(label.htmlFor).toBe('customer-email');
    expect(input.getAttribute('aria-describedby')).toBe('customer-email-hint');
  });

  it('exposes validation errors to assistive technology', () => {
    fixture.componentRef.setInput('id', 'customer-email');
    fixture.componentRef.setInput('error', 'Enter a valid email address.');
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe('customer-email-error');
    expect(fixture.nativeElement.textContent).toContain('Enter a valid email address.');
  });

  it('propagates changes and touched state through ControlValueAccessor', () => {
    const onChange = vi.fn();
    const onTouched = vi.fn();
    fixture.componentInstance.registerOnChange(onChange);
    fixture.componentInstance.registerOnTouched(onTouched);
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = 'customer@example.com';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('blur'));

    expect(onChange).toHaveBeenCalledWith('customer@example.com');
    expect(onTouched).toHaveBeenCalledOnce();
  });
});
