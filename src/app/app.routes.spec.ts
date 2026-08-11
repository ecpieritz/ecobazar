import { routes } from './app.routes';

describe('Application routes', () => {
  it('should expose the storefront routes in priority order', () => {
    expect(routes.map(({ path }) => path)).toEqual([
      '',
      'shop',
      'cart',
      'wishlist',
      'checkout',
      'login',
      'register',
      'account',
      'about',
      'faq',
      'contact',
      '**',
    ]);
  });

  it('should lazy load every route', () => {
    expect(routes.every(({ loadChildren, loadComponent }) => loadChildren || loadComponent)).toBe(
      true,
    );
  });

  it('should keep the wildcard route last', () => {
    expect(routes.at(-1)?.path).toBe('**');
  });
});
