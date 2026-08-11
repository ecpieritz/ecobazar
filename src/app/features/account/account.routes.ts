import { Routes } from '@angular/router';

export const ACCOUNT_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'My account | Ecobazar',
    loadComponent: () =>
      import('./pages/dashboard-page/dashboard-page').then(({ DashboardPage }) => DashboardPage),
  },
  {
    path: 'orders',
    pathMatch: 'full',
    title: 'Order history | Ecobazar',
    loadComponent: () =>
      import('./pages/order-history-page/order-history-page').then(
        ({ OrderHistoryPage }) => OrderHistoryPage,
      ),
  },
  {
    path: 'orders/:orderId',
    title: 'Order details | Ecobazar',
    loadComponent: () =>
      import('./pages/order-detail-page/order-detail-page').then(
        ({ OrderDetailPage }) => OrderDetailPage,
      ),
  },
  {
    path: 'settings',
    title: 'Account settings | Ecobazar',
    loadComponent: () =>
      import('./pages/settings-page/settings-page').then(({ SettingsPage }) => SettingsPage),
  },
];
