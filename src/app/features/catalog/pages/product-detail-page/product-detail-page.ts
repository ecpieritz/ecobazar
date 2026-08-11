import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-product-detail-page',
  template: `
    <main class="container">
      <h1>Product details</h1>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetailPage {}
