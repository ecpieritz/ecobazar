import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-cart-page',
  template: `
    <main class="container">
      <h1>Shopping cart</h1>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartPage {}
