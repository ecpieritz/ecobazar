import { Routes } from '@angular/router';

import { breadcrumbRouteData } from '@layout/breadcrumb-banner/breadcrumb-item';

export const CATALOG_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Shop | Ecobazar',
    data: breadcrumbRouteData({ label: 'Shop' }),
    loadComponent: () =>
      import('./pages/catalog-page/catalog-page').then(({ CatalogPage }) => CatalogPage),
  },
  {
    path: ':slug',
    title: 'Product details | Ecobazar',
    data: breadcrumbRouteData({ label: 'Shop', route: '/shop' }, { label: 'Product Details' }),
    loadComponent: () =>
      import('./pages/product-detail-page/product-detail-page').then(
        ({ ProductDetailPage }) => ProductDetailPage,
      ),
  },
];
