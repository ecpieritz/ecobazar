import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { StorefrontSearch } from './storefront-search';

@Component({
  selector: 'app-storefront-navigation',
  imports: [RouterLink, RouterLinkActive, StorefrontSearch],
  templateUrl: './storefront-navigation.html',
  styleUrl: './storefront-navigation.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StorefrontNavigation {
  readonly isOpen = input.required<boolean>();
  readonly searchTerm = input('');
  readonly dismissed = output<void>();
  readonly navigated = output<void>();
  readonly searchRequested = output<string>();

  protected dismiss(): void {
    this.dismissed.emit();
  }

  protected notifyNavigation(): void {
    this.navigated.emit();
  }

  protected searchProducts(query: string): void {
    this.searchRequested.emit(query);
  }
}
