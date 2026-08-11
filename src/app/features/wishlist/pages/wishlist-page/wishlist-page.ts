import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-wishlist-page',
  template: `
    <main class="container">
      <h1>Wishlist</h1>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WishlistPage {}
