import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import type { Product } from '@core/domain';
import { ShoppingCartStore } from '@core/state';
import { FeedbackMessage, Modal } from '@shared/ui';

import { ProductGallery } from '../../pages/product-detail-page/product-gallery/product-gallery';
import {
  ProductSummary,
  type ProductCartSelection,
} from '../../pages/product-detail-page/product-summary/product-summary';

@Component({
  selector: 'app-product-quick-view-modal',
  imports: [FeedbackMessage, Modal, ProductGallery, ProductSummary, RouterLink],
  templateUrl: './product-quick-view-modal.html',
  styleUrl: './product-quick-view-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductQuickViewModal {
  readonly product = input<Product | null>(null);
  readonly open = model(false);

  protected readonly cartNotice = signal<string | null>(null);
  private readonly shoppingCart = inject(ShoppingCartStore);
  private activeProductId: Product['id'] | null = null;

  constructor() {
    effect(() => {
      const productId = this.product()?.id ?? null;

      if (productId !== this.activeProductId) {
        this.activeProductId = productId;
        this.cartNotice.set(null);
      }
    });
  }

  protected showCartNotice({ product, quantity }: ProductCartSelection): void {
    const addedQuantity = this.shoppingCart.addProduct(product, quantity);

    if (!addedQuantity) {
      this.cartNotice.set(`${product.name} is already at the maximum available quantity.`);
      return;
    }

    this.cartNotice.set(
      `${addedQuantity} ${addedQuantity === 1 ? 'item' : 'items'} of ${product.name} added to your cart.`,
    );
  }

  protected closeForNavigation(): void {
    this.open.set(false);
  }
}
