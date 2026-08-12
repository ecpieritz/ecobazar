import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  forwardRef,
  input,
  output,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type FormControlType = 'email' | 'password' | 'search' | 'tel' | 'text' | 'url';

let nextControlId = 0;

@Component({
  selector: 'app-form-control',
  templateUrl: './form-control.html',
  styleUrl: './form-control.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormControlField),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormControlField implements ControlValueAccessor {
  readonly label = input.required<string>();
  readonly id = input(`form-control-${nextControlId++}`);
  readonly name = input<string | null>(null);
  readonly type = input<FormControlType>('text');
  readonly placeholder = input('');
  readonly autocomplete = input<string | null>(null);
  readonly hint = input<string | null>(null);
  readonly error = input<string | null>(null);
  readonly hideLabel = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly value = input('');
  readonly valueChange = output<string>();

  protected readonly currentValue = signal('');
  protected readonly disabledByForms = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.disabledByForms());
  protected readonly describedBy = computed(() => {
    if (this.error()) {
      return `${this.id()}-error`;
    }

    return this.hint() ? `${this.id()}-hint` : null;
  });

  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  constructor() {
    effect(() => this.currentValue.set(this.value()));
  }

  writeValue(value: string | null): void {
    this.currentValue.set(value ?? '');
  }

  registerOnChange(onChange: (value: string) => void): void {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: () => void): void {
    this.onTouched = onTouched;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabledByForms.set(isDisabled);
  }

  protected updateValue(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.currentValue.set(value);
    this.valueChange.emit(value);
    this.onChange(value);
  }

  protected markAsTouched(): void {
    this.onTouched();
  }
}
