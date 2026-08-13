import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, map, of, startWith } from 'rxjs';

import { ProductRepository } from '@core/data-access';
import type { Product } from '@core/domain';
import { ProductCard } from '@shared/ui';

interface ProductGroups {
  readonly featured: readonly Product[];
  readonly promotional: readonly Product[];
}

type ProductSectionsState =
  | { readonly status: 'loading'; readonly groups: ProductGroups }
  | { readonly status: 'success'; readonly groups: ProductGroups }
  | { readonly status: 'error'; readonly groups: ProductGroups };

const EMPTY_GROUPS: ProductGroups = { featured: [], promotional: [] };

@Component({
  selector: 'app-home-product-sections',
  imports: [ProductCard, RouterLink],
  templateUrl: './home-product-sections.html',
  styleUrl: './home-product-sections.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeProductSections {
  private readonly productRepository = inject(ProductRepository);

  protected readonly state = toSignal(
    this.productRepository.getProducts({ page: 1, pageSize: 100, sort: 'featured' }).pipe(
      map(({ data }): ProductSectionsState => {
        const groups: ProductGroups = {
          featured: data.filter(({ featured }) => featured).slice(0, 5),
          promotional: data
            .filter(({ compareAtPrice, price }) => (compareAtPrice?.amount ?? 0) > price.amount)
            .sort(
              (first, second) => this.discountPercentage(second) - this.discountPercentage(first),
            )
            .slice(0, 4),
        };

        return { status: 'success', groups };
      }),
      startWith<ProductSectionsState>({ status: 'loading', groups: EMPTY_GROUPS }),
      catchError(() => of<ProductSectionsState>({ status: 'error', groups: EMPTY_GROUPS })),
    ),
    { requireSync: true },
  );

  protected discountPercentage(product: Product): number {
    const compareAtPrice = product.compareAtPrice?.amount;

    if (compareAtPrice === undefined || compareAtPrice <= product.price.amount) {
      return 0;
    }

    return Math.round(((compareAtPrice - product.price.amount) / compareAtPrice) * 100);
  }
}
