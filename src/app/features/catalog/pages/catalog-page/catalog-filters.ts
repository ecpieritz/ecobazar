import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

import type { ProductFilterOptions } from '@core/api';
import type { ProductCategory, Rating } from '@core/domain';

import { type CatalogFilterPatch, type CatalogFilters } from './catalog-filter.model';

const priceValue = (value: FormDataEntryValue | null): number | null => {
  const parsed = Number(value);
  return value === null || value === '' || !Number.isFinite(parsed) || parsed < 0 ? null : parsed;
};

@Component({
  selector: 'app-catalog-filters',
  imports: [RouterLink],
  templateUrl: './catalog-filters.html',
  styleUrl: './catalog-filters.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogFiltersPanel {
  readonly categories = input.required<readonly ProductCategory[]>();
  readonly categoriesLoading = input(false);
  readonly filterOptions = input.required<ProductFilterOptions>();
  readonly filterOptionsLoading = input(false);
  readonly filters = input.required<CatalogFilters>();
  readonly activeCount = input(0);
  readonly expanded = input(false);

  readonly filtersChanged = output<CatalogFilterPatch>();
  readonly filtersCleared = output<void>();
  readonly closeRequested = output<void>();

  protected readonly stars = [1, 2, 3, 4, 5] as const;

  protected selectCategory(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.filtersChanged.emit({ category: value || null });
  }

  protected selectRating(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.filtersChanged.emit({ minimumRating: value === 0 ? null : (value as Rating) });
  }

  protected applyPriceRange(event: SubmitEvent): void {
    event.preventDefault();
    const data = new FormData(event.currentTarget as HTMLFormElement);
    let minimumPrice = priceValue(data.get('minimumPrice'));
    let maximumPrice = priceValue(data.get('maximumPrice'));

    if (minimumPrice !== null && maximumPrice !== null && minimumPrice > maximumPrice) {
      [minimumPrice, maximumPrice] = [maximumPrice, minimumPrice];
    }

    this.filtersChanged.emit({ minimumPrice, maximumPrice });
  }

  protected toggleTag(tag: string): void {
    const currentTags = this.filters().tags;
    const tags = currentTags.includes(tag)
      ? currentTags.filter((currentTag) => currentTag !== tag)
      : [...currentTags, tag];

    this.filtersChanged.emit({ tags: tags.length ? tags : null });
  }

  protected toggleAvailability(event: Event): void {
    this.filtersChanged.emit({ inStock: (event.target as HTMLInputElement).checked || null });
  }

  protected toggleSale(event: Event): void {
    this.filtersChanged.emit({ sale: (event.target as HTMLInputElement).checked || null });
  }

  protected toggleFeatured(event: Event): void {
    this.filtersChanged.emit({ featured: (event.target as HTMLInputElement).checked || null });
  }
}
