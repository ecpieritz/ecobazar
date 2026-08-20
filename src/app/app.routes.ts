import { Routes } from '@angular/router';

import { breadcrumbRouteData } from '@layout/breadcrumb-banner/breadcrumb-item';
import { authMatchGuard, guestGuard } from '@core/auth';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Home | Ecobazar',
    loadComponent: () =>
      import('@features/home/pages/home-page/home-page').then(({ HomePage }) => HomePage),
  },
  {
    path: 'shop',
    loadChildren: () =>
      import('@features/catalog/catalog.routes').then(({ CATALOG_ROUTES }) => CATALOG_ROUTES),
  },
  {
    path: 'cart',
    title: 'Shopping cart | Ecobazar',
    data: breadcrumbRouteData({ label: 'Shopping Cart' }),
    loadComponent: () =>
      import('@features/cart/pages/cart-page/cart-page').then(({ CartPage }) => CartPage),
  },
  {
    path: 'wishlist',
    title: 'Wishlist | Ecobazar',
    data: breadcrumbRouteData({ label: 'Wishlist' }),
    loadComponent: () =>
      import('@features/wishlist/pages/wishlist-page/wishlist-page').then(
        ({ WishlistPage }) => WishlistPage,
      ),
  },
  {
    path: 'checkout',
    title: 'Checkout | Ecobazar',
    data: breadcrumbRouteData({ label: 'Shopping Cart', route: '/cart' }, { label: 'Checkout' }),
    loadComponent: () =>
      import('@features/checkout/pages/checkout-page/checkout-page').then(
        ({ CheckoutPage }) => CheckoutPage,
      ),
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    title: 'Sign in | Ecobazar',
    data: breadcrumbRouteData({ label: 'Account', route: '/account' }, { label: 'Login' }),
    loadComponent: () =>
      import('@features/auth/pages/login-page/login-page').then(({ LoginPage }) => LoginPage),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    title: 'Create account | Ecobazar',
    data: breadcrumbRouteData({ label: 'Account', route: '/account' }, { label: 'Create Account' }),
    loadComponent: () =>
      import('@features/auth/pages/register-page/register-page').then(
        ({ RegisterPage }) => RegisterPage,
      ),
  },
  {
    path: 'account',
    canMatch: [authMatchGuard],
    loadChildren: () =>
      import('@features/account/account.routes').then(({ ACCOUNT_ROUTES }) => ACCOUNT_ROUTES),
  },
  {
    path: 'about',
    title: 'About us | Ecobazar',
    data: breadcrumbRouteData({ label: 'About Us' }),
    loadComponent: () =>
      import('@features/content/pages/about-page/about-page').then(({ AboutPage }) => AboutPage),
  },
  {
    path: 'faq',
    title: 'Frequently asked questions | Ecobazar',
    data: breadcrumbRouteData({ label: 'FAQs' }),
    loadComponent: () =>
      import('@features/content/pages/faq-page/faq-page').then(({ FaqPage }) => FaqPage),
  },
  {
    path: 'contact',
    title: 'Contact us | Ecobazar',
    data: breadcrumbRouteData({ label: 'Contact' }),
    loadComponent: () =>
      import('@features/content/pages/contact-page/contact-page').then(
        ({ ContactPage }) => ContactPage,
      ),
  },
  {
    path: '**',
    title: 'Page not found | Ecobazar',
    data: breadcrumbRouteData({ label: '404 Error Page' }),
    loadComponent: () =>
      import('@features/not-found/pages/not-found-page/not-found-page').then(
        ({ NotFoundPage }) => NotFoundPage,
      ),
  },
];
