import type { CartItem, Product } from '@core/domain';
import { createPersistenceKey, type LocalStorageService } from '@core/persistence';

export interface CartStoreState {
  readonly items: readonly CartItem[];
  readonly products: ReadonlyMap<string, Product>;
  readonly updatedAt: string;
}

interface PersistedCartState {
  readonly version: 1;
  readonly items: readonly CartItem[];
  readonly products: readonly Product[];
  readonly updatedAt: string;
}

const CART_STORAGE_KEY = createPersistenceKey<unknown>('shopping-cart');
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isProductSnapshot = (value: unknown): value is Product => {
  if (!isRecord(value) || !isRecord(value['price']) || !isRecord(value['inventory'])) {
    return false;
  }

  return (
    typeof value['id'] === 'string' &&
    typeof value['slug'] === 'string' &&
    typeof value['name'] === 'string' &&
    typeof value['price']['amount'] === 'number' &&
    value['price']['currency'] === 'USD' &&
    typeof value['inventory']['quantity'] === 'number' &&
    Array.isArray(value['images']) &&
    Array.isArray(value['tags'])
  );
};

const isCartItem = (value: unknown): value is CartItem =>
  isRecord(value) &&
  typeof value['productId'] === 'string' &&
  typeof value['quantity'] === 'number' &&
  Number.isFinite(value['quantity']);

export const emptyCartState = (): CartStoreState => ({
  items: [],
  products: new Map(),
  updatedAt: new Date().toISOString(),
});

export const restoreCartState = (storage: LocalStorageService): CartStoreState => {
  const persisted = storage.get(CART_STORAGE_KEY);

  if (
    !isRecord(persisted) ||
    persisted['version'] !== 1 ||
    !Array.isArray(persisted['items']) ||
    !Array.isArray(persisted['products'])
  ) {
    return emptyCartState();
  }

  const products = new Map(
    persisted['products']
      .filter(isProductSnapshot)
      .map((product) => [product.id, product] as const),
  );
  const quantities = new Map<string, number>();

  for (const item of persisted['items'].filter(isCartItem)) {
    const product = products.get(item.productId);

    if (!product || product.inventory.quantity <= 0 || item.quantity <= 0) {
      continue;
    }

    const quantity = Math.min(
      product.inventory.quantity,
      (quantities.get(item.productId) ?? 0) + Math.floor(item.quantity),
    );
    quantities.set(item.productId, quantity);
  }

  const items = [...quantities].map(([productId, quantity]) => ({ productId, quantity }));
  const activeProducts = new Map(
    items.flatMap(({ productId }) => {
      const product = products.get(productId);
      return product ? ([[productId, product]] as const) : [];
    }),
  );

  return {
    items,
    products: activeProducts,
    updatedAt:
      typeof persisted['updatedAt'] === 'string'
        ? persisted['updatedAt']
        : new Date().toISOString(),
  };
};

export const persistCartState = (storage: LocalStorageService, state: CartStoreState): void => {
  if (!state.items.length) {
    storage.remove(CART_STORAGE_KEY);
    return;
  }

  const persisted: PersistedCartState = {
    version: 1,
    items: state.items,
    products: state.items.flatMap(({ productId }) => {
      const product = state.products.get(productId);
      return product ? [product] : [];
    }),
    updatedAt: state.updatedAt,
  };
  storage.set(CART_STORAGE_KEY, persisted);
};
