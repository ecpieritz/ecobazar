import type { Product } from '@core/domain';
import { createPersistenceKey, type LocalStorageService } from '@core/persistence';

export interface WishlistState {
  readonly products: readonly Product[];
  readonly updatedAt: string;
}

interface PersistedWishlistState {
  readonly version: 1;
  readonly products: readonly Product[];
  readonly updatedAt: string;
}

const WISHLIST_STORAGE_KEY = createPersistenceKey<unknown>('wishlist');
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isProductSnapshot = (value: unknown): value is Product =>
  isRecord(value) &&
  isRecord(value['price']) &&
  isRecord(value['inventory']) &&
  typeof value['id'] === 'string' &&
  typeof value['slug'] === 'string' &&
  typeof value['name'] === 'string' &&
  typeof value['price']['amount'] === 'number' &&
  value['price']['currency'] === 'USD' &&
  typeof value['inventory']['quantity'] === 'number' &&
  Array.isArray(value['images']);

export const emptyWishlistState = (): WishlistState => ({
  products: [],
  updatedAt: new Date().toISOString(),
});

export const restoreWishlistState = (storage: LocalStorageService): WishlistState => {
  const persisted = storage.get(WISHLIST_STORAGE_KEY);

  if (!isRecord(persisted) || persisted['version'] !== 1 || !Array.isArray(persisted['products'])) {
    return emptyWishlistState();
  }

  const products = [
    ...new Map(
      persisted['products'].filter(isProductSnapshot).map((product) => [product.id, product]),
    ).values(),
  ];

  return {
    products,
    updatedAt:
      typeof persisted['updatedAt'] === 'string'
        ? persisted['updatedAt']
        : new Date().toISOString(),
  };
};

export const persistWishlistState = (storage: LocalStorageService, state: WishlistState): void => {
  if (!state.products.length) {
    storage.remove(WISHLIST_STORAGE_KEY);
    return;
  }

  const persisted: PersistedWishlistState = {
    version: 1,
    products: state.products,
    updatedAt: state.updatedAt,
  };
  storage.set(WISHLIST_STORAGE_KEY, persisted);
};
