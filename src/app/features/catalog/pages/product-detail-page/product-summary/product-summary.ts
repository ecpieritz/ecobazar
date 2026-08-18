import { CurrencyPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import type { Product, ProductUnit } from '@core/domain';
import { Button, Rating } from '@shared/ui';

export interface ProductCartSelection {
  readonly product: Product;
  readonly quantity: number;
}

const UNIT_LABELS: Readonly<Record<ProductUnit, string>> = {
  each: 'each',
  kg: 'kg',
  lb: 'lb',
  bunch: 'bunch',
};

@Component({
  selector: 'app-product-summary',
  imports: [Button, CurrencyPipe, Rating, RouterLink],
  templateUrl: './product-summary.html',
  styleUrl: './product-summary.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductSummary {
  readonly product = input.required<Product>();
  readonly categoryName = input<string | null>(null);
  readonly categorySlug = input<string | null>(null);

  readonly addRequested = output<ProductCartSelection>();

  protected readonly quantity = signal(1);
  protected readonly wishlisted = signal(false);
  private activeProductId: Product['id'] | null = null;
  protected readonly unavailable = computed(
    () => this.product().inventory.status === 'out-of-stock',
  );
  protected readonly maximumQuantity = computed(() =>
    Math.max(1, this.product().inventory.quantity),
  );
  protected readonly unitLabel = computed(() => UNIT_LABELS[this.product().unit]);
  protected readonly discount = computed(() => {
    const price = this.product().price.amount;
    const compareAt = this.product().compareAtPrice?.amount;

    return compareAt && compareAt > price
      ? Math.round(((compareAt - price) / compareAt) * 100)
      : null;
  });
  protected readonly categoryRoute = computed(() => (this.categorySlug() ? ['/shop'] : null));
  protected readonly categoryQuery = computed(() =>
    this.categorySlug() ? { category: this.categorySlug() } : null,
  );

  constructor() {
    effect(() => {
      const productId = this.product().id;

      if (productId !== this.activeProductId) {
        this.activeProductId = productId;
        this.quantity.set(1);
        this.wishlisted.set(false);
      }
    });
  }

  protected decreaseQuantity(): void {
    this.quantity.update((quantity) => Math.max(1, quantity - 1));
  }

  protected increaseQuantity(): void {
    this.quantity.update((quantity) => Math.min(this.maximumQuantity(), quantity + 1));
  }

  protected changeQuantity(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    const quantity = Number.isFinite(value) ? Math.round(value) : 1;
    this.quantity.set(Math.min(this.maximumQuantity(), Math.max(1, quantity)));
  }

  protected requestAddToCart(): void {
    if (!this.unavailable()) {
      this.addRequested.emit({ product: this.product(), quantity: this.quantity() });
    }
  }

  protected toggleWishlist(): void {
    this.wishlisted.update((wishlisted) => !wishlisted);
  }
}
