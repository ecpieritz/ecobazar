import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import type { CouponApplicationResult, Product } from '@core/domain';
import { FREE_SHIPPING_THRESHOLD, ShoppingCartStore } from '@core/state';

@Component({
  selector: 'app-cart-page',
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './cart-page.html',
  styleUrls: ['./cart-page.scss', './cart-page-coupon.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartPage {
  protected readonly shoppingCart = inject(ShoppingCartStore);
  protected readonly couponCode = signal('');
  protected readonly couponFeedback = signal<CouponApplicationResult | null>(null);
  protected readonly freeShippingThreshold = FREE_SHIPPING_THRESHOLD;

  protected primaryImage(product: Product): Product['images'][number] | null {
    return product.images.find(({ isPrimary }) => isPrimary) ?? product.images[0] ?? null;
  }

  protected decreaseQuantity(productId: string, quantity: number): void {
    this.shoppingCart.updateQuantity(productId, quantity - 1);
    this.clearStaleFeedback();
  }

  protected increaseQuantity(productId: string, quantity: number): void {
    this.shoppingCart.updateQuantity(productId, quantity + 1);
    this.clearStaleFeedback();
  }

  protected changeQuantity(productId: string, event: Event): void {
    const quantity = Number((event.target as HTMLInputElement).value);
    this.shoppingCart.updateQuantity(productId, quantity);
    this.clearStaleFeedback();
  }

  protected removeProduct(productId: string): void {
    this.shoppingCart.removeProduct(productId);
    this.clearStaleFeedback();
  }

  protected updateCouponCode(event: Event): void {
    this.couponCode.set((event.target as HTMLInputElement).value);
  }

  protected applyCoupon(event: Event): void {
    event.preventDefault();
    const result = this.shoppingCart.applyCoupon(this.couponCode());
    this.couponFeedback.set(result);

    if (result.status === 'applied') {
      this.couponCode.set('');
    }
  }

  protected removeCoupon(): void {
    this.shoppingCart.removeCoupon();
    this.couponFeedback.set(null);
  }

  private clearStaleFeedback(): void {
    this.couponFeedback.set(null);
  }
}
