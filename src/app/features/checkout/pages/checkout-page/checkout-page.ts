import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import type { AddressPayload, ApiErrorResponse, PlaceOrderRequest } from '@core/api';
import { AuthStore } from '@core/auth';
import { OrderRepository } from '@core/data-access';
import type { Address, Order, PaymentMethod } from '@core/domain';
import { ShoppingCartStore } from '@core/state';

@Component({
  selector: 'app-checkout-page',
  imports: [CurrencyPipe, ReactiveFormsModule, RouterLink],
  templateUrl: './checkout-page.html',
  styleUrls: ['./checkout-page.scss', './checkout-page-status.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly repository = inject(OrderRepository);
  private readonly auth = inject(AuthStore);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly cart = inject(ShoppingCartStore);
  protected readonly pending = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly placedOrder = signal<Order | null>(null);
  protected readonly stockIssue = computed(() => {
    const line = this.cart
      .lines()
      .find(
        ({ product, quantity }) =>
          product.inventory.status === 'out-of-stock' || quantity > product.inventory.quantity,
      );
    return line ? `${line.product.name} no longer has the requested quantity in stock.` : null;
  });

  protected readonly form = this.formBuilder.nonNullable.group({
    billing: this.createAddressGroup(),
    shipToDifferentAddress: [false],
    shipping: this.createAddressGroup(),
    paymentMethod: ['cash-on-delivery' as PaymentMethod, Validators.required],
    notes: ['', Validators.maxLength(500)],
  });

  protected readonly countries = ['United States', 'Canada', 'Brazil'];
  protected readonly states = ['California', 'Florida', 'Illinois', 'New Mexico', 'New York'];

  constructor() {
    this.prefillCustomerAddress();
    this.form.controls.shipping.disable();
    this.form.controls.shipToDifferentAddress.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((differentAddress) => {
        if (differentAddress) this.form.controls.shipping.enable();
        else this.form.controls.shipping.disable();
      });
  }

  protected submit(): void {
    this.form.markAllAsTouched();
    this.errorMessage.set(null);
    const stockIssue = this.stockIssue();

    if (this.cart.isEmpty()) {
      this.errorMessage.set('Your shopping cart is empty.');
      return;
    }
    if (stockIssue) {
      this.errorMessage.set(stockIssue);
      return;
    }
    if (this.form.invalid || this.pending()) return;

    const value = this.form.getRawValue();
    const request: PlaceOrderRequest = {
      items: this.cart.items().map(({ productId, quantity }) => ({ productId, quantity })),
      billingAddress: value.billing,
      shippingAddress: value.shipToDifferentAddress ? value.shipping : value.billing,
      paymentMethod: value.paymentMethod,
      ...(this.cart.appliedCoupon() ? { couponCode: this.cart.appliedCoupon()!.code } : {}),
      ...(value.notes.trim() ? { notes: value.notes.trim() } : {}),
    };

    this.pending.set(true);
    this.repository
      .placeOrder(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (order) => {
          this.placedOrder.set(order);
          this.cart.clear();
          this.pending.set(false);
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage.set(this.apiMessage(error));
          this.pending.set(false);
        },
      });
  }

  private createAddressGroup() {
    return this.formBuilder.nonNullable.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      company: [''],
      street: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      state: ['', Validators.required],
      postalCode: ['', [Validators.required, Validators.pattern(/^[\w -]{4,12}$/)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[+()\d\s-]{7,20}$/)]],
    });
  }

  private prefillCustomerAddress(): void {
    const customer = this.auth.customer();
    if (!customer) return;
    const address = customer.addresses.find(({ isDefault }) => isDefault) ?? customer.addresses[0];
    const value = address
      ? this.addressPayload(address)
      : {
          firstName: customer.firstName,
          lastName: customer.lastName,
          company: '',
          street: '',
          city: '',
          country: '',
          state: '',
          postalCode: '',
          email: customer.email,
          phone: customer.phone ?? '',
        };
    this.form.controls.billing.patchValue(value);
    this.form.controls.shipping.patchValue(value);
  }

  private addressPayload(address: Address): AddressPayload {
    return {
      firstName: address.firstName,
      lastName: address.lastName,
      company: address.company ?? '',
      street: address.street,
      city: address.city,
      country: address.country,
      state: address.state,
      postalCode: address.postalCode,
      email: address.email,
      phone: address.phone,
    };
  }

  private apiMessage(error: HttpErrorResponse): string {
    return (
      (error.error as ApiErrorResponse | undefined)?.error?.message ??
      'The order could not be placed. Please review your details and try again.'
    );
  }
}
