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

import type { ApiErrorResponse } from '@core/api';
import { AuthStore } from '@core/auth';
import { CustomerRepository } from '@core/data-access';

const passwordsMatch = (control: AbstractControl): ValidationErrors | null =>
  control.get('newPassword')?.value === control.get('confirmPassword')?.value
    ? null
    : { passwordMismatch: true };

@Component({
  selector: 'app-settings-page',
  imports: [ReactiveFormsModule],
  templateUrl: './settings-page.html',
  styleUrl: './settings-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPage {
  private readonly auth = inject(AuthStore);
  private readonly repository = inject(CustomerRepository);
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly customer = this.auth.customer();
  private readonly address = this.customer?.addresses[0];

  protected readonly profileMessage = signal<string | null>(null);
  protected readonly addressMessage = signal<string | null>(null);
  protected readonly passwordMessage = signal<string | null>(null);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly savingProfile = signal(false);
  protected readonly savingAddress = signal(false);
  protected readonly savingPassword = signal(false);
  protected readonly passwordVisible = signal(false);

  protected readonly profileForm = this.formBuilder.nonNullable.group({
    firstName: [this.customer?.firstName ?? '', [Validators.required, Validators.minLength(2)]],
    lastName: [this.customer?.lastName ?? '', [Validators.required, Validators.minLength(2)]],
    email: [this.customer?.email ?? '', [Validators.required, Validators.email]],
    phone: [this.customer?.phone ?? ''],
    avatarUrl: [this.customer?.avatarUrl ?? ''],
  });

  protected readonly addressForm = this.formBuilder.nonNullable.group({
    firstName: [this.address?.firstName ?? this.customer?.firstName ?? '', Validators.required],
    lastName: [this.address?.lastName ?? this.customer?.lastName ?? '', Validators.required],
    company: [this.address?.company ?? ''],
    street: [this.address?.street ?? '', Validators.required],
    city: [this.address?.city ?? '', Validators.required],
    state: [this.address?.state ?? '', Validators.required],
    postalCode: [this.address?.postalCode ?? '', Validators.required],
    country: [this.address?.country ?? 'United States', Validators.required],
    email: [
      this.address?.email ?? this.customer?.email ?? '',
      [Validators.required, Validators.email],
    ],
    phone: [this.address?.phone ?? this.customer?.phone ?? '', Validators.required],
  });

  protected readonly passwordForm = this.formBuilder.nonNullable.group(
    {
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordsMatch },
  );

  protected chooseAvatar(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file || !file.type.startsWith('image/') || file.size > 2_000_000) {
      this.errorMessage.set('Choose an image smaller than 2 MB.');
      return;
    }
    const reader = new FileReader();
    reader.addEventListener('load', () =>
      this.profileForm.controls.avatarUrl.setValue(String(reader.result)),
    );
    reader.readAsDataURL(file);
  }

  protected saveProfile(): void {
    this.profileForm.markAllAsTouched();
    if (this.profileForm.invalid || this.savingProfile()) return;
    this.resetMessages();
    this.savingProfile.set(true);
    this.repository
      .updateProfile(this.profileForm.getRawValue())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (customer) => {
          this.auth.updateCustomer(customer);
          this.profileMessage.set('Profile updated successfully.');
          this.savingProfile.set(false);
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage.set(this.apiMessage(error));
          this.savingProfile.set(false);
        },
      });
  }

  protected saveAddress(): void {
    this.addressForm.markAllAsTouched();
    if (this.addressForm.invalid || this.savingAddress()) return;
    this.resetMessages();
    this.savingAddress.set(true);
    const addressId = this.address?.id ?? 'address-billing';
    this.repository
      .updateAddress(addressId, this.addressForm.getRawValue())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (address) => {
          const customer = this.auth.customer();
          if (customer)
            this.auth.updateCustomer({
              ...customer,
              addresses: [address],
              updatedAt: new Date().toISOString(),
            });
          this.addressMessage.set('Billing address updated successfully.');
          this.savingAddress.set(false);
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage.set(this.apiMessage(error));
          this.savingAddress.set(false);
        },
      });
  }

  protected changePassword(): void {
    this.passwordForm.markAllAsTouched();
    if (this.passwordForm.invalid || this.savingPassword()) return;
    this.resetMessages();
    this.savingPassword.set(true);
    const value = this.passwordForm.getRawValue();
    const request = {
      currentPassword: value.currentPassword,
      newPassword: value.newPassword,
    };
    this.repository
      .changePassword(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.passwordForm.reset();
          this.passwordMessage.set('Password changed successfully.');
          this.savingPassword.set(false);
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage.set(this.apiMessage(error));
          this.savingPassword.set(false);
        },
      });
  }

  private resetMessages(): void {
    this.profileMessage.set(null);
    this.addressMessage.set(null);
    this.passwordMessage.set(null);
    this.errorMessage.set(null);
  }
  private apiMessage(error: HttpErrorResponse): string {
    return (
      (error.error as ApiErrorResponse | undefined)?.error?.message ??
      'The change could not be saved.'
    );
  }
}
