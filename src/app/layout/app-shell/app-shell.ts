import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

import { BreadcrumbBanner } from '../breadcrumb-banner/breadcrumb-banner';
import { BREADCRUMBS_ROUTE_DATA, type BreadcrumbItem } from '../breadcrumb-banner/breadcrumb-item';
import { NewsletterSignup } from '../newsletter-signup/newsletter-signup';
import { NotificationOutlet } from '../notification-outlet/notification-outlet';
import { ShoppingCartDrawer } from '../shopping-cart-drawer/shopping-cart-drawer';
import { StorefrontFooter } from '../storefront-footer/storefront-footer';
import { StorefrontHeader } from '../storefront-header/storefront-header';

@Component({
  selector: 'app-shell',
  imports: [
    RouterOutlet,
    StorefrontHeader,
    BreadcrumbBanner,
    NewsletterSignup,
    NotificationOutlet,
    ShoppingCartDrawer,
    StorefrontFooter,
  ],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppShell {
  protected readonly breadcrumbs = signal<readonly BreadcrumbItem[]>([]);
  protected readonly cartDrawerOpen = signal(false);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly document = inject(DOCUMENT);
  private activePath = this.router.url.split(/[?#]/)[0];

  constructor() {
    this.updateBreadcrumbs();
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => {
        this.cartDrawerOpen.set(false);
        this.updateBreadcrumbs();
        const nextPath = event.urlAfterRedirects.split(/[?#]/)[0];
        if (nextPath !== this.activePath) {
          this.activePath = nextPath;
          setTimeout(() => this.document.getElementById('main-content')?.focus());
        }
      });
  }

  private updateBreadcrumbs(): void {
    let route = this.activatedRoute.snapshot;

    while (route.firstChild) {
      route = route.firstChild;
    }

    const breadcrumbs = route.data[BREADCRUMBS_ROUTE_DATA];
    this.breadcrumbs.set(
      Array.isArray(breadcrumbs) ? (breadcrumbs as readonly BreadcrumbItem[]) : [],
    );
  }
}
