import type { ProductSortOption } from '@core/api';
import type { Rating } from '@core/domain';

export interface CatalogFilters {
  readonly page: number;
  readonly search: string | null;
  readonly category: string | null;
  readonly minimumPrice: number | null;
  readonly maximumPrice: number | null;
  readonly minimumRating: Rating | null;
  readonly tags: readonly string[];
  readonly inStock: boolean;
  readonly sale: boolean;
  readonly featured: boolean;
  readonly sort: ProductSortOption;
}

export interface CatalogFilterPatch {
  readonly category?: string | null;
  readonly minimumPrice?: number | null;
  readonly maximumPrice?: number | null;
  readonly minimumRating?: Rating | null;
  readonly tags?: readonly string[] | null;
  readonly inStock?: boolean | null;
  readonly sale?: boolean | null;
  readonly featured?: boolean | null;
}
