import { API_ENDPOINTS } from './api-endpoints';

describe('API_ENDPOINTS', () => {
  it('should encode dynamic product paths', () => {
    expect(API_ENDPOINTS.products.bySlug('green apple')).toBe('/products/green%20apple');
    expect(API_ENDPOINTS.products.reviews('product/01')).toBe('/products/product%2F01/reviews');
  });

  it('should encode customer and order identifiers', () => {
    expect(API_ENDPOINTS.customers.address('billing address')).toBe(
      '/customers/me/addresses/billing%20address',
    );
    expect(API_ENDPOINTS.orders.byId('#4152')).toBe('/orders/%234152');
  });
});
