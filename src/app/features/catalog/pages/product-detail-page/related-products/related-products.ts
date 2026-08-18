import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';

import type { Product } from '@core/domain';
import { ProductCard } from '@shared/ui';

import { ProductQuickViewModal } from '../../../components/product-quick-view-modal/product-quick-view-modal';

@Component({
  selector: 'app-related-products',
  imports: [ProductCard, ProductQuickViewModal],
  templateUrl: './related-products.html',
  styleUrl: './related-products.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RelatedProducts {
  readonly products = input.required<readonly Product[]>();
  readonly heading = input('Related products');

  protected readonly quickViewProduct = signal<Product | null>(null);
  protected readonly quickViewOpen = signal(false);

  protected openQuickView(product: Product): void {
    this.quickViewProduct.set(product);
    this.quickViewOpen.set(true);
  }
}
