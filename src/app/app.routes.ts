import { Routes } from '@angular/router';

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
    loadComponent: () =>
      import('@features/cart/pages/cart-page/cart-page').then(({ CartPage }) => CartPage),
  },
  {
    path: 'wishlist',
    title: 'Wishlist | Ecobazar',
    loadComponent: () =>
      import('@features/wishlist/pages/wishlist-page/wishlist-page').then(
        ({ WishlistPage }) => WishlistPage,
      ),
  },
  {
    path: 'checkout',
    title: 'Checkout | Ecobazar',
    loadComponent: () =>
      import('@features/checkout/pages/checkout-page/checkout-page').then(
        ({ CheckoutPage }) => CheckoutPage,
      ),
  },
  {
    path: 'login',
    title: 'Sign in | Ecobazar',
    loadComponent: () =>
      import('@features/auth/pages/login-page/login-page').then(({ LoginPage }) => LoginPage),
  },
  {
    path: 'register',
    title: 'Create account | Ecobazar',
    loadComponent: () =>
      import('@features/auth/pages/register-page/register-page').then(
        ({ RegisterPage }) => RegisterPage,
      ),
  },
  {
    path: 'account',
    loadChildren: () =>
      import('@features/account/account.routes').then(({ ACCOUNT_ROUTES }) => ACCOUNT_ROUTES),
  },
  {
    path: 'about',
    title: 'About us | Ecobazar',
    loadComponent: () =>
      import('@features/content/pages/about-page/about-page').then(({ AboutPage }) => AboutPage),
  },
  {
    path: 'faq',
    title: 'Frequently asked questions | Ecobazar',
    loadComponent: () =>
      import('@features/content/pages/faq-page/faq-page').then(({ FaqPage }) => FaqPage),
  },
  {
    path: 'contact',
    title: 'Contact us | Ecobazar',
    loadComponent: () =>
      import('@features/content/pages/contact-page/contact-page').then(
        ({ ContactPage }) => ContactPage,
      ),
  },
  {
    path: '**',
    title: 'Page not found | Ecobazar',
    loadComponent: () =>
      import('@features/not-found/pages/not-found-page/not-found-page').then(
        ({ NotFoundPage }) => NotFoundPage,
      ),
  },
];
