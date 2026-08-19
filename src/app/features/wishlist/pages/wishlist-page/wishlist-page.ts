import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import type { Product } from '@core/domain';
import { WishlistStore } from '@core/state';

@Component({
  selector: 'app-wishlist-page',
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './wishlist-page.html',
  styleUrl: './wishlist-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WishlistPage {
  protected readonly wishlist = inject(WishlistStore);
  protected readonly feedback = signal<string | null>(null);

  protected primaryImage(product: Product): Product['images'][number] | null {
    return product.images.find(({ isPrimary }) => isPrimary) ?? product.images[0] ?? null;
  }

  protected moveToCart(product: Product): void {
    const addedQuantity = this.wishlist.moveToCart(product.id);
    this.feedback.set(
      addedQuantity
        ? `${product.name} was moved to your cart.`
        : `${product.name} could not be added because it is unavailable or already at the stock limit.`,
    );
  }

  protected removeProduct(product: Product): void {
    this.wishlist.removeProduct(product.id);
    this.feedback.set(`${product.name} was removed from your wishlist.`);
  }
}
