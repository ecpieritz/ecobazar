import { Injectable } from '@angular/core';

import type { Product } from '@core/domain';

interface RankedProduct {
  readonly product: Product;
  readonly score: number;
}

@Injectable({ providedIn: 'root' })
export class ProductRecommendationService {
  recommend(
    currentProduct: Product,
    candidates: readonly Product[],
    limit = 4,
  ): readonly Product[] {
    if (limit <= 0) {
      return [];
    }

    return candidates
      .filter(
        (candidate) =>
          candidate.id !== currentProduct.id &&
          candidate.inventory.status !== 'out-of-stock' &&
          this.isRelevant(currentProduct, candidate),
      )
      .map((product): RankedProduct => ({
        product,
        score: this.relevanceScore(currentProduct, product),
      }))
      .sort(
        (first, second) =>
          second.score - first.score || first.product.name.localeCompare(second.product.name),
      )
      .slice(0, limit)
      .map(({ product }) => product);
  }

  private isRelevant(currentProduct: Product, candidate: Product): boolean {
    return (
      candidate.categoryId === currentProduct.categoryId ||
      candidate.tags.some((tag) => currentProduct.tags.includes(tag))
    );
  }

  private relevanceScore(currentProduct: Product, candidate: Product): number {
    const sharedTagCount = candidate.tags.filter((tag) => currentProduct.tags.includes(tag)).length;
    const sameCategoryScore = candidate.categoryId === currentProduct.categoryId ? 100 : 0;
    const sharedTagsScore = sharedTagCount * 6;
    const featuredScore = candidate.featured ? 4 : 0;
    const stockScore = candidate.inventory.status === 'in-stock' ? 2 : 1;

    return (
      sameCategoryScore + sharedTagsScore + featuredScore + stockScore + candidate.rating.average
    );
  }
}
