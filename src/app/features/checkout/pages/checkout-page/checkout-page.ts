import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-checkout-page',
  template: `
    <main class="container">
      <h1>Checkout</h1>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutPage {}
