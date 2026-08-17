import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, distinctUntilChanged, forkJoin, map, of, startWith, switchMap } from 'rxjs';

import { CategoryRepository, ProductRepository, ReviewRepository } from '@core/data-access';
import type { Product, ProductCategory, ProductReview } from '@core/domain';
import { FeedbackMessage, ProductCard } from '@shared/ui';

import { ProductGallery } from './product-gallery/product-gallery';
import {
  ProductInformation,
  type ProductInformationTab,
} from './product-information/product-information';
import { ProductSummary, type ProductCartSelection } from './product-summary/product-summary';

interface ProductDetailData {
  readonly product: Product;
  readonly category: ProductCategory | null;
  readonly reviews: readonly ProductReview[];
  readonly relatedProducts: readonly Product[];
}

type ProductDetailState =
  | { readonly status: 'loading'; readonly data: null }
  | { readonly status: 'success'; readonly data: ProductDetailData }
  | { readonly status: 'error'; readonly data: null };

const LOADING_STATE: ProductDetailState = { status: 'loading', data: null };
const INFORMATION_TABS: readonly ProductInformationTab[] = ['description', 'details', 'reviews'];

@Component({
  selector: 'app-product-detail-page',
  imports: [
    FeedbackMessage,
    ProductCard,
    ProductGallery,
    ProductInformation,
    ProductSummary,
    RouterLink,
  ],
  templateUrl: './product-detail-page.html',
  styleUrl: './product-detail-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly title = inject(Title);
  private readonly productRepository = inject(ProductRepository);
  private readonly categoryRepository = inject(CategoryRepository);
  private readonly reviewRepository = inject(ReviewRepository);

  protected readonly cartNotice = signal<string | null>(null);
  protected readonly informationTab = toSignal(
    this.route.queryParamMap.pipe(
      map((params): ProductInformationTab => {
        const tab = params.get('tab') as ProductInformationTab | null;
        return tab && INFORMATION_TABS.includes(tab) ? tab : 'description';
      }),
      distinctUntilChanged(),
    ),
    { initialValue: 'description' as ProductInformationTab },
  );

  protected readonly state = toSignal(
    this.route.paramMap.pipe(
      map((params) => params.get('slug')?.trim() ?? ''),
      distinctUntilChanged(),
      switchMap((slug) => {
        if (!slug) {
          return of<ProductDetailState>({ status: 'error', data: null });
        }

        return this.productRepository.getProductBySlug(slug).pipe(
          switchMap((product) =>
            forkJoin({
              categories: this.categoryRepository.getCategories(),
              reviews: this.reviewRepository.getProductReviews({
                productId: product.id,
                page: 1,
                pageSize: 100,
              }),
              related: this.productRepository.getProducts({
                category: product.categoryId,
                page: 1,
                pageSize: 5,
                sort: 'featured',
              }),
            }).pipe(
              map(({ categories, related, reviews }): ProductDetailState => ({
                status: 'success',
                data: {
                  product,
                  category: categories.find(({ id }) => id === product.categoryId) ?? null,
                  reviews: reviews.data,
                  relatedProducts: related.data.filter(({ id }) => id !== product.id).slice(0, 4),
                },
              })),
            ),
          ),
          catchError(() => of<ProductDetailState>({ status: 'error', data: null })),
          startWith<ProductDetailState>(LOADING_STATE),
        );
      }),
    ),
    { initialValue: LOADING_STATE },
  );

  constructor() {
    effect(() => {
      const state = this.state();

      if (state.status === 'success') {
        this.title.setTitle(`${state.data.product.name} | Ecobazar`);
      }
    });
  }

  protected showCartNotice({ product, quantity }: ProductCartSelection): void {
    const unit = quantity === 1 ? 'item' : 'items';
    this.cartNotice.set(`${quantity} ${unit} of ${product.name} added to your demo cart.`);
  }

  protected dismissCartNotice(): void {
    this.cartNotice.set(null);
  }

  protected changeInformationTab(tab: ProductInformationTab): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: tab === 'description' ? null : tab },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}
