import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { StorefrontNavigation } from './storefront-navigation';

@Component({
  selector: 'app-storefront-header',
  imports: [RouterLink, StorefrontNavigation],
  templateUrl: './storefront-header.html',
  styleUrl: './storefront-header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StorefrontHeader {
  protected readonly isMenuOpen = signal(false);

  protected toggleMenu(): void {
    this.isMenuOpen.update((isOpen) => !isOpen);
  }

  protected closeMenu(): void {
    this.isMenuOpen.set(false);
  }

  protected preventSearchNavigation(event: SubmitEvent): void {
    event.preventDefault();
  }
}
