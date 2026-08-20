import { inject } from '@angular/core';
import { type CanActivateFn, type CanMatchFn, Router } from '@angular/router';

import { AuthStore } from './auth.store';

const authorize = (returnUrl: string) => {
  const auth = inject(AuthStore);
  const router = inject(Router);
  return auth.isAuthenticated()
    ? true
    : router.createUrlTree(['/login'], { queryParams: { returnUrl } });
};

export const authGuard: CanActivateFn = (_route, state) => authorize(state.url);
export const authMatchGuard: CanMatchFn = (_route, segments) =>
  authorize(`/${segments.map(({ path }) => path).join('/')}`);

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthStore);
  return auth.isAuthenticated() ? inject(Router).createUrlTree(['/account']) : true;
};
