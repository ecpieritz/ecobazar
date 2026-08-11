import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-order-history-page',
  template: `
    <main class="container">
      <h1>Order history</h1>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderHistoryPage {}
