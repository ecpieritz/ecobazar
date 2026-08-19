import { computed, inject, Injectable, signal } from '@angular/core';

import type { EntityId, Product } from '@core/domain';
import { LocalStorageService } from '@core/persistence';

import { ShoppingCartStore } from '../cart';
import {
  emptyWishlistState,
  persistWishlistState,
  restoreWishlistState,
  type WishlistState,
} from './wishlist-storage';

@Injectable({ providedIn: 'root' })
export class WishlistStore {
  private readonly storage = inject(LocalStorageService);
  private readonly shoppingCart = inject(ShoppingCartStore);
  private readonly state = signal<WishlistState>(restoreWishlistState(this.storage));

  readonly products = computed(() => this.state().products);
  readonly itemCount = computed(() => this.products().length);
  readonly isEmpty = computed(() => this.itemCount() === 0);

  hasProduct(productId: EntityId): boolean {
    return this.products().some(({ id }) => id === productId);
  }

  addProduct(product: Product): boolean {
    if (this.hasProduct(product.id)) {
      return false;
    }

    this.commit([...this.products(), product]);
    return true;
  }

  removeProduct(productId: EntityId): boolean {
    if (!this.hasProduct(productId)) {
      return false;
    }

    this.commit(this.products().filter(({ id }) => id !== productId));
    return true;
  }

  toggleProduct(product: Product): boolean {
    if (this.hasProduct(product.id)) {
      this.removeProduct(product.id);
      return false;
    }

    this.addProduct(product);
    return true;
  }

  moveToCart(productId: EntityId): number {
    const product = this.products().find(({ id }) => id === productId);

    if (!product) {
      return 0;
    }

    const addedQuantity = this.shoppingCart.addProduct(product);

    if (addedQuantity > 0) {
      this.removeProduct(productId);
    }

    return addedQuantity;
  }

  clear(): void {
    const state = emptyWishlistState();
    this.state.set(state);
    persistWishlistState(this.storage, state);
  }

  private commit(products: readonly Product[]): void {
    const state: WishlistState = { products, updatedAt: new Date().toISOString() };
    this.state.set(state);
    persistWishlistState(this.storage, state);
  }
}
