import { TestBed } from '@angular/core/testing';

import { PRODUCTS_FIXTURE } from '@core/mock-api/fixtures';

import { ProductRecommendationService } from './product-recommendation.service';

describe('ProductRecommendationService', () => {
  let service: ProductRecommendationService;
  const currentProduct = PRODUCTS_FIXTURE.find(({ slug }) => slug === 'chinese-cabbage')!;

  beforeEach(() => {
    service = TestBed.inject(ProductRecommendationService);
  });

  it('ranks available products by category, shared tags, featured status, and rating', () => {
    const recommendations = service.recommend(currentProduct, PRODUCTS_FIXTURE, 4);

    expect(recommendations.map(({ slug }) => slug)).toEqual([
      'green-capsicum',
      'fresh-cauliflower',
      'red-capsicum',
      'green-cucumber',
    ]);
  });

  it('excludes the current product and unavailable candidates', () => {
    const recommendations = service.recommend(currentProduct, PRODUCTS_FIXTURE, 20);

    expect(recommendations.some(({ id }) => id === currentProduct.id)).toBe(false);
    expect(recommendations.some(({ inventory }) => inventory.status === 'out-of-stock')).toBe(
      false,
    );
  });

  it('returns no recommendations when the requested limit is not positive', () => {
    expect(service.recommend(currentProduct, PRODUCTS_FIXTURE, 0)).toEqual([]);
  });
});
