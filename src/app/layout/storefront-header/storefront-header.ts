import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  HostListener,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';

import { StorefrontNavigation } from './storefront-navigation';
import { StorefrontSearch } from './storefront-search';

@Component({
  selector: 'app-storefront-header',
  imports: [RouterLink, StorefrontNavigation, StorefrontSearch],
  templateUrl: './storefront-header.html',
  styleUrl: './storefront-header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StorefrontHeader {
  protected readonly isMenuOpen = signal(false);
  protected readonly searchTerm = signal('');
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.syncSearchTerm();

    effect((onCleanup) => {
      if (!this.isMenuOpen()) {
        return;
      }

      const previousOverflow = this.document.body.style.overflow;
      this.document.body.style.overflow = 'hidden';
      onCleanup(() => (this.document.body.style.overflow = previousOverflow));
    });

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.closeMenu();
        this.syncSearchTerm();
      });
  }

  protected toggleMenu(): void {
    this.isMenuOpen.update((isOpen) => !isOpen);
  }

  protected closeMenu(): void {
    this.isMenuOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  protected closeMenuOnEscape(): void {
    this.closeMenu();
  }

  @HostListener('window:resize', ['$event'])
  protected closeMenuAtDesktopBreakpoint(event: Event): void {
    const viewport = event.target as Window | null;

    if ((viewport?.innerWidth ?? 0) >= 992) {
      this.closeMenu();
    }
  }

  protected searchProducts(query: string): void {
    void this.router.navigate(['/shop'], {
      queryParams: query ? { search: query } : {},
    });
  }

  private syncSearchTerm(): void {
    this.searchTerm.set(
      this.router.parseUrl(this.router.url).queryParamMap.get('search')?.trim() ?? '',
    );
  }
}
