import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

import type { Product, ProductBadge, ProductUnit } from '@core/domain';

import { Rating } from '../rating/rating';

const BADGE_LABELS: Readonly<Record<ProductBadge, string>> = {
  sale: 'Sale',
  new: 'New',
  'best-sale': 'Best sale',
};

const UNIT_LABELS: Readonly<Record<ProductUnit, string>> = {
  each: 'each',
  kg: 'kg',
  lb: 'lb',
  bunch: 'bunch',
};

@Component({
  selector: 'app-product-card',
  imports: [CurrencyPipe, Rating, RouterLink],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCard {
  readonly product = input.required<Product>();
  readonly wishlisted = input(false);

  readonly addToCart = output<Product>();
  readonly toggleWishlist = output<Product>();
  readonly quickView = output<Product>();

  protected readonly productRoute = computed(() => ['/shop', this.product().slug]);
  protected readonly primaryImage = computed(
    () => this.product().images.find(({ isPrimary }) => isPrimary) ?? this.product().images[0],
  );
  protected readonly unavailable = computed(
    () => this.product().inventory.status === 'out-of-stock',
  );
  protected readonly badgeLabel = computed(() => {
    const badge = this.product().badge;
    return badge ? BADGE_LABELS[badge] : null;
  });
  protected readonly unitLabel = computed(() => UNIT_LABELS[this.product().unit]);
  protected readonly discountPercentage = computed(() => {
    const { amount } = this.product().price;
    const compareAt = this.product().compareAtPrice?.amount;

    if (compareAt === undefined || compareAt <= amount || compareAt <= 0) {
      return null;
    }

    return Math.round(((compareAt - amount) / compareAt) * 100);
  });
}
