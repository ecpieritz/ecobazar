import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, model } from '@angular/core';
import { RouterLink } from '@angular/router';

import type { Product } from '@core/domain';
import { ShoppingCartStore } from '@core/state';
import { Drawer } from '@shared/ui';

@Component({
  selector: 'app-shopping-cart-drawer',
  imports: [CurrencyPipe, Drawer, RouterLink],
  templateUrl: './shopping-cart-drawer.html',
  styleUrl: './shopping-cart-drawer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShoppingCartDrawer {
  readonly open = model(false);

  protected readonly shoppingCart = inject(ShoppingCartStore);
  protected readonly drawerTitle = computed(
    () => `Shopping cart (${this.shoppingCart.itemCount()})`,
  );

  protected primaryImage(product: Product): Product['images'][number] | null {
    return product.images.find(({ isPrimary }) => isPrimary) ?? product.images[0] ?? null;
  }

  protected removeProduct(productId: string): void {
    this.shoppingCart.removeProduct(productId);
  }

  protected closeForNavigation(): void {
    this.open.set(false);
  }
}
