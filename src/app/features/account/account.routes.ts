import { Routes } from '@angular/router';

import { breadcrumbRouteData } from '@layout/breadcrumb-banner/breadcrumb-item';

export const ACCOUNT_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'My account | Ecobazar',
    data: breadcrumbRouteData({ label: 'Account', route: '/account' }, { label: 'Dashboard' }),
    loadComponent: () =>
      import('./pages/dashboard-page/dashboard-page').then(({ DashboardPage }) => DashboardPage),
  },
  {
    path: 'orders',
    pathMatch: 'full',
    title: 'Order history | Ecobazar',
    data: breadcrumbRouteData({ label: 'Account', route: '/account' }, { label: 'Order History' }),
    loadComponent: () =>
      import('./pages/order-history-page/order-history-page').then(
        ({ OrderHistoryPage }) => OrderHistoryPage,
      ),
  },
  {
    path: 'orders/:orderId',
    title: 'Order details | Ecobazar',
    data: breadcrumbRouteData(
      { label: 'Account', route: '/account' },
      { label: 'Order History', route: '/account/orders' },
      { label: 'Order Detail' },
    ),
    loadComponent: () =>
      import('./pages/order-detail-page/order-detail-page').then(
        ({ OrderDetailPage }) => OrderDetailPage,
      ),
  },
  {
    path: 'settings',
    title: 'Account settings | Ecobazar',
    data: breadcrumbRouteData({ label: 'Account', route: '/account' }, { label: 'Settings' }),
    loadComponent: () =>
      import('./pages/settings-page/settings-page').then(({ SettingsPage }) => SettingsPage),
  },
];
