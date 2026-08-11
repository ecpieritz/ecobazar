import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-order-detail-page',
  template: `
    <main class="container">
      <h1>Order details</h1>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderDetailPage {}
