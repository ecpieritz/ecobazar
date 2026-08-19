import {
  ChangeDetectionStrategy,
  Component,
  computed,
  HostListener,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, type ParamMap, type Params, Router } from '@angular/router';
import { catchError, distinctUntilChanged, map, of, startWith, switchMap } from 'rxjs';

import type {
  PaginationMeta,
  ProductFilterOptions,
  ProductListQuery,
  ProductSortOption,
} from '@core/api';
import { CategoryRepository, ProductRepository } from '@core/data-access';
import type { Product, ProductCategory, Rating } from '@core/domain';
import { ShoppingCartStore, WishlistStore } from '@core/state';
import { Button, Drawer, ProductCard } from '@shared/ui';

import { ProductQuickViewModal } from '../../components/product-quick-view-modal/product-quick-view-modal';
import { type CatalogFilterPatch, type CatalogFilters } from './catalog-filter.model';
import { CatalogFiltersPanel } from './catalog-filters';

const PAGE_SIZE = 12;
const PAGE_SIZE_OPTIONS = [6, 12, 24] as const;
const EMPTY_PAGINATION: PaginationMeta = {
  page: 1,
  pageSize: PAGE_SIZE,
  totalItems: 0,
  totalPages: 0,
};
const EMPTY_FILTER_OPTIONS: ProductFilterOptions = {
  priceRange: { minimum: 0, maximum: 100, currency: 'USD' },
  ratings: ([5, 4, 3, 2, 1] as const).map((value) => ({ value, productCount: 0 })),
  tags: [],
};
const SORT_OPTIONS: readonly ProductSortOption[] = [
  'featured',
  'newest',
  'price-ascending',
  'price-descending',
  'rating',
];

type PaginationItem = number | 'ellipsis';

type CatalogState =
  | {
      readonly status: 'loading';
      readonly products: readonly Product[];
      readonly pagination: PaginationMeta;
    }
  | {
      readonly status: 'success';
      readonly products: readonly Product[];
      readonly pagination: PaginationMeta;
    }
  | {
      readonly status: 'error';
      readonly products: readonly Product[];
      readonly pagination: PaginationMeta;
    };

type CategoryState =
  | { readonly status: 'loading'; readonly categories: readonly ProductCategory[] }
  | { readonly status: 'success'; readonly categories: readonly ProductCategory[] }
  | { readonly status: 'error'; readonly categories: readonly ProductCategory[] };

type FilterOptionsState =
  | { readonly status: 'loading'; readonly options: ProductFilterOptions }
  | { readonly status: 'success'; readonly options: ProductFilterOptions }
  | { readonly status: 'error'; readonly options: ProductFilterOptions };

const numberParam = (params: ParamMap, name: string): number | null => {
  const rawValue = params.get(name);
  const value = rawValue === null ? Number.NaN : Number(rawValue);
  return Number.isFinite(value) && value >= 0 ? value : null;
};

const filtersFromParams = (params: ParamMap): CatalogFilters => {
  const page = Number(params.get('page'));
  const requestedPageSize = Number(params.get('pageSize'));
  const rating = Number(params.get('minimumRating'));
  const sortValue = params.get('sort') as ProductSortOption | null;
  const tags = [
    ...new Set(
      params
        .getAll('tags')
        .flatMap((tag) => tag.split(','))
        .filter(Boolean),
    ),
  ];

  return {
    page: Number.isInteger(page) && page > 0 ? page : 1,
    pageSize: PAGE_SIZE_OPTIONS.includes(requestedPageSize as 6 | 12 | 24)
      ? requestedPageSize
      : PAGE_SIZE,
    search: params.get('search')?.trim() || null,
    category: params.get('category'),
    minimumPrice: numberParam(params, 'minimumPrice'),
    maximumPrice: numberParam(params, 'maximumPrice'),
    minimumRating:
      Number.isInteger(rating) && rating >= 1 && rating <= 5 ? (rating as Rating) : null,
    tags,
    inStock: params.get('inStock') === 'true',
    sale: params.get('sale') === 'true',
    featured: params.get('featured') === 'true',
    sort: sortValue && SORT_OPTIONS.includes(sortValue) ? sortValue : 'featured',
  };
};

const productQuery = (filters: CatalogFilters): ProductListQuery => ({
  page: filters.page,
  pageSize: filters.pageSize,
  sort: filters.sort,
  ...(filters.search ? { search: filters.search } : {}),
  ...(filters.category ? { category: filters.category } : {}),
  ...(filters.minimumPrice !== null ? { minimumPrice: filters.minimumPrice } : {}),
  ...(filters.maximumPrice !== null ? { maximumPrice: filters.maximumPrice } : {}),
  ...(filters.minimumRating !== null ? { minimumRating: filters.minimumRating } : {}),
  ...(filters.tags.length ? { tags: filters.tags } : {}),
  ...(filters.inStock ? { inStock: true } : {}),
  ...(filters.sale ? { sale: true } : {}),
  ...(filters.featured ? { featured: true } : {}),
});

@Component({
  selector: 'app-catalog-page',
  imports: [Button, CatalogFiltersPanel, Drawer, ProductCard, ProductQuickViewModal],
  templateUrl: './catalog-page.html',
  styleUrl: './catalog-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly categoryRepository = inject(CategoryRepository);
  private readonly productRepository = inject(ProductRepository);
  private readonly shoppingCart = inject(ShoppingCartStore);
  protected readonly wishlist = inject(WishlistStore);

  protected readonly filtersExpanded = signal(false);
  protected readonly quickViewProduct = signal<Product | null>(null);
  protected readonly quickViewOpen = signal(false);
  protected readonly pageSizeOptions = PAGE_SIZE_OPTIONS;
  protected readonly sortOptions: readonly { value: ProductSortOption; label: string }[] = [
    { value: 'featured', label: 'Featured' },
    { value: 'newest', label: 'Newest' },
    { value: 'price-ascending', label: 'Price: low to high' },
    { value: 'price-descending', label: 'Price: high to low' },
    { value: 'rating', label: 'Top rated' },
  ];

  protected readonly filters = toSignal(this.route.queryParamMap.pipe(map(filtersFromParams)), {
    requireSync: true,
  });

  protected readonly categoryState = toSignal(
    this.categoryRepository.getCategories().pipe(
      map((categories): CategoryState => ({ status: 'success', categories })),
      startWith<CategoryState>({ status: 'loading', categories: [] }),
      catchError(() => of<CategoryState>({ status: 'error', categories: [] })),
    ),
    { requireSync: true },
  );

  protected readonly filterOptionsState = toSignal(
    this.productRepository.getFilterOptions().pipe(
      map((options): FilterOptionsState => ({ status: 'success', options })),
      startWith<FilterOptionsState>({ status: 'loading', options: EMPTY_FILTER_OPTIONS }),
      catchError(() => of<FilterOptionsState>({ status: 'error', options: EMPTY_FILTER_OPTIONS })),
    ),
    { requireSync: true },
  );

  protected readonly state = toSignal(
    this.route.queryParamMap.pipe(
      map(filtersFromParams),
      distinctUntilChanged(
        (previous, current) => JSON.stringify(previous) === JSON.stringify(current),
      ),
      switchMap((filters) =>
        this.productRepository.getProducts(productQuery(filters)).pipe(
          map(({ data, pagination }): CatalogState => ({
            status: 'success',
            products: data,
            pagination,
          })),
          startWith<CatalogState>({
            status: 'loading',
            products: [],
            pagination: {
              ...EMPTY_PAGINATION,
              page: filters.page,
              pageSize: filters.pageSize,
            },
          }),
          catchError(() =>
            of<CatalogState>({
              status: 'error',
              products: [],
              pagination: EMPTY_PAGINATION,
            }),
          ),
        ),
      ),
    ),
    { requireSync: true },
  );

  protected readonly activeFilterCount = computed(() => {
    const filters = this.filters();
    return (
      Number(filters.search !== null) +
      Number(filters.category !== null) +
      Number(filters.minimumPrice !== null || filters.maximumPrice !== null) +
      Number(filters.minimumRating !== null) +
      filters.tags.length +
      Number(filters.inStock) +
      Number(filters.sale) +
      Number(filters.featured)
    );
  });

  protected readonly paginationItems = computed<readonly PaginationItem[]>(() => {
    const { page, totalPages } = this.state().pagination;

    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const visiblePages = new Set([1, totalPages, page - 1, page, page + 1]);

    if (page <= 4) {
      [2, 3, 4, 5].forEach((visiblePage) => visiblePages.add(visiblePage));
    }

    if (page >= totalPages - 3) {
      [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1].forEach((visiblePage) =>
        visiblePages.add(visiblePage),
      );
    }

    const pages = [...visiblePages]
      .filter((visiblePage) => visiblePage >= 1 && visiblePage <= totalPages)
      .sort((first, second) => first - second);

    return pages.flatMap<PaginationItem>((visiblePage, index) => {
      const previousPage = pages[index - 1];
      return previousPage !== undefined && visiblePage - previousPage > 1
        ? ['ellipsis', visiblePage]
        : [visiblePage];
    });
  });

  protected isPageNumber(item: PaginationItem): item is number {
    return typeof item === 'number';
  }

  protected updateFilters(patch: CatalogFilterPatch): void {
    const queryParams: Params = { page: null, ...patch };
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
    });
  }

  protected clearFilters(): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        page: null,
        search: null,
        category: null,
        minimumPrice: null,
        maximumPrice: null,
        minimumRating: null,
        tags: null,
        inStock: null,
        sale: null,
        featured: null,
      },
      queryParamsHandling: 'merge',
    });
  }

  protected closeFilterDrawer(): void {
    this.filtersExpanded.set(false);
  }

  protected openQuickView(product: Product): void {
    this.quickViewProduct.set(product);
    this.quickViewOpen.set(true);
  }

  protected addProductToCart(product: Product): void {
    this.shoppingCart.addProduct(product);
  }

  protected toggleWishlist(product: Product): void {
    this.wishlist.toggleProduct(product);
  }

  protected changeSort(event: Event): void {
    const sort = (event.target as HTMLSelectElement).value as ProductSortOption;
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { sort: sort === 'featured' ? null : sort, page: null },
      queryParamsHandling: 'merge',
    });
  }

  protected clearSearch(): void {
    this.updateFilters({ search: null });
  }

  protected changePageSize(event: Event): void {
    const pageSize = Number((event.target as HTMLSelectElement).value);

    if (!PAGE_SIZE_OPTIONS.includes(pageSize as 6 | 12 | 24)) {
      return;
    }

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { pageSize: pageSize === PAGE_SIZE ? null : pageSize, page: null },
      queryParamsHandling: 'merge',
    });
  }

  protected goToPage(page: number): void {
    if (page < 1 || page > this.state().pagination.totalPages) {
      return;
    }

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: page === 1 ? null : page },
      queryParamsHandling: 'merge',
    });
  }

  @HostListener('window:resize', ['$event'])
  protected closeFilterDrawerAtDesktopBreakpoint(event: Event): void {
    const viewport = event.target as Window | null;

    if ((viewport?.innerWidth ?? 0) >= 992) {
      this.closeFilterDrawer();
    }
  }
}
