import { Routes } from '@angular/router';

export const CATALOG_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Shop | Ecobazar',
    loadComponent: () =>
      import('./pages/catalog-page/catalog-page').then(({ CatalogPage }) => CatalogPage),
  },
  {
    path: ':slug',
    title: 'Product details | Ecobazar',
    loadComponent: () =>
      import('./pages/product-detail-page/product-detail-page').then(
        ({ ProductDetailPage }) => ProductDetailPage,
      ),
  },
];
