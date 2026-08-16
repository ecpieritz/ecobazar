import {
  CurrencyCode,
  EntityId,
  Product,
  ProductCategory,
  ProductReview,
  Rating,
} from '@core/domain';

import { ApiResponse, PaginatedApiResponse, PaginationQuery } from './api.contracts';

export type ProductSortOption =
  'featured' | 'newest' | 'price-ascending' | 'price-descending' | 'rating';

export interface ProductListQuery extends PaginationQuery {
  readonly search?: string;
  readonly category?: string;
  readonly minimumPrice?: number;
  readonly maximumPrice?: number;
  readonly minimumRating?: Rating;
  readonly tags?: readonly string[];
  readonly inStock?: boolean;
  readonly sale?: boolean;
  readonly featured?: boolean;
  readonly sort?: ProductSortOption;
}

export interface ReviewListQuery extends PaginationQuery {
  readonly productId: EntityId;
}

export interface CreateReviewRequest {
  readonly rating: Rating;
  readonly comment: string;
}

export interface ProductFilterOption {
  readonly value: string;
  readonly label: string;
  readonly productCount: number;
}

export interface ProductRatingFilterOption {
  readonly value: Rating;
  readonly productCount: number;
}

export interface ProductFilterOptions {
  readonly priceRange: {
    readonly minimum: number;
    readonly maximum: number;
    readonly currency: CurrencyCode;
  };
  readonly ratings: readonly ProductRatingFilterOption[];
  readonly tags: readonly ProductFilterOption[];
}

export type ProductListResponse = PaginatedApiResponse<Product>;
export type ProductResponse = ApiResponse<Product>;
export type ProductFilterOptionsResponse = ApiResponse<ProductFilterOptions>;
export type CategoryListResponse = ApiResponse<readonly ProductCategory[]>;
export type ReviewListResponse = PaginatedApiResponse<ProductReview>;
export type ReviewResponse = ApiResponse<ProductReview>;
