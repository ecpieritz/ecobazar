import { PRODUCT_CATEGORIES_FIXTURE } from './categories.fixture';
import { PRODUCTS_FIXTURE } from './products.fixture';
import { PRODUCT_REVIEWS_FIXTURE } from './reviews.fixture';

describe('Product catalog fixtures', () => {
  it('should keep product identifiers, slugs, and SKUs unique', () => {
    expect(new Set(PRODUCTS_FIXTURE.map(({ id }) => id)).size).toBe(PRODUCTS_FIXTURE.length);
    expect(new Set(PRODUCTS_FIXTURE.map(({ slug }) => slug)).size).toBe(PRODUCTS_FIXTURE.length);
    expect(new Set(PRODUCTS_FIXTURE.map(({ sku }) => sku)).size).toBe(PRODUCTS_FIXTURE.length);
  });

  it('should reference valid categories and expose accurate product counts', () => {
    const categoryIds = new Set(PRODUCT_CATEGORIES_FIXTURE.map(({ id }) => id));

    for (const product of PRODUCTS_FIXTURE) {
      expect(categoryIds.has(product.categoryId)).toBe(true);
    }

    for (const category of PRODUCT_CATEGORIES_FIXTURE) {
      const productCount = PRODUCTS_FIXTURE.filter(
        ({ categoryId }) => categoryId === category.id,
      ).length;

      expect(category.productCount).toBe(productCount);
    }
  });

  it('should keep stock, prices, and primary images consistent', () => {
    for (const product of PRODUCTS_FIXTURE) {
      const expectedStockStatus =
        product.inventory.quantity === 0
          ? 'out-of-stock'
          : product.inventory.quantity <= 10
            ? 'low-stock'
            : 'in-stock';

      expect(product.inventory.status).toBe(expectedStockStatus);
      expect(product.images.filter(({ isPrimary }) => isPrimary)).toHaveLength(1);
      expect(product.price.amount).toBeGreaterThan(0);

      if (product.compareAtPrice) {
        expect(product.compareAtPrice.currency).toBe(product.price.currency);
        expect(product.compareAtPrice.amount).toBeGreaterThan(product.price.amount);
      }
    }
  });

  it('should keep product rating summaries aligned with review fixtures', () => {
    for (const product of PRODUCTS_FIXTURE) {
      const reviews = PRODUCT_REVIEWS_FIXTURE.filter(({ productId }) => productId === product.id);
      const average = reviews.reduce((total, { rating }) => total + rating, 0) / reviews.length;

      expect(product.rating.count).toBe(reviews.length);
      expect(product.rating.average).toBeCloseTo(average);
    }
  });
});
