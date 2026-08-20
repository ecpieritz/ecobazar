import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import type { ApiErrorResponse } from '@core/api';
import { AuthStore } from '@core/auth';

const matchingPasswords = (control: AbstractControl): ValidationErrors | null =>
  control.get('password')?.value === control.get('confirmPassword')?.value
    ? null
    : { passwordMismatch: true };

@Component({
  selector: 'app-register-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register-page.html',
  styleUrl: '../auth-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly auth = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly passwordVisible = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly pending = this.auth.isPending;
  protected readonly form = this.formBuilder.nonNullable.group(
    {
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
      acceptedTerms: [false, Validators.requiredTrue],
    },
    { validators: matchingPasswords },
  );

  protected submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.pending()) return;
    const value = this.form.getRawValue();
    const request = {
      firstName: value.firstName,
      lastName: value.lastName,
      email: value.email,
      password: value.password,
      acceptedTerms: value.acceptedTerms,
    };
    this.errorMessage.set(null);
    this.auth
      .register(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => void this.router.navigateByUrl('/account'),
        error: (error: HttpErrorResponse) => this.errorMessage.set(this.apiMessage(error)),
      });
  }

  private apiMessage(error: HttpErrorResponse): string {
    return (
      (error.error as ApiErrorResponse | undefined)?.error?.message ??
      'Registration failed. Please try again.'
    );
  }
}
