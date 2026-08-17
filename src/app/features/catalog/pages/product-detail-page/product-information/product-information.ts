import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  input,
  output,
  signal,
  viewChildren,
} from '@angular/core';

import type { Product, ProductReview } from '@core/domain';
import { Button, Rating } from '@shared/ui';

export type ProductInformationTab = 'description' | 'details' | 'reviews';

const INFORMATION_TABS: readonly ProductInformationTab[] = ['description', 'details', 'reviews'];
const REVIEWS_PER_PAGE = 3;

@Component({
  selector: 'app-product-information',
  imports: [Button, DatePipe, Rating],
  templateUrl: './product-information.html',
  styleUrl: './product-information.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductInformation {
  readonly product = input.required<Product>();
  readonly categoryName = input.required<string>();
  readonly reviews = input<readonly ProductReview[]>([]);
  readonly activeTab = input<ProductInformationTab>('description');

  readonly tabChanged = output<ProductInformationTab>();

  private readonly tabButtons = viewChildren<ElementRef<HTMLButtonElement>>('tabButton');
  protected readonly visibleReviewCount = signal(REVIEWS_PER_PAGE);
  protected readonly visibleReviews = computed(() =>
    this.reviews().slice(0, this.visibleReviewCount()),
  );
  protected readonly hasMoreReviews = computed(
    () => this.visibleReviewCount() < this.reviews().length,
  );

  constructor() {
    effect(() => this.resetVisibleReviews(this.product().id));
  }

  protected selectTab(tab: ProductInformationTab): void {
    if (tab !== this.activeTab()) {
      this.tabChanged.emit(tab);
    }
  }

  protected handleTabKeydown(event: KeyboardEvent, currentTab: ProductInformationTab): void {
    const currentIndex = INFORMATION_TABS.indexOf(currentTab);
    const nextIndex = this.keyboardDestination(event.key, currentIndex);

    if (nextIndex === null) {
      return;
    }

    event.preventDefault();
    this.tabChanged.emit(INFORMATION_TABS[nextIndex]);
    this.tabButtons()[nextIndex]?.nativeElement.focus();
  }

  protected loadMoreReviews(): void {
    this.visibleReviewCount.update((count) =>
      Math.min(count + REVIEWS_PER_PAGE, this.reviews().length),
    );
  }

  private resetVisibleReviews(productId: string): void {
    if (productId) {
      this.visibleReviewCount.set(REVIEWS_PER_PAGE);
    }
  }

  private keyboardDestination(key: string, currentIndex: number): number | null {
    switch (key) {
      case 'ArrowRight':
        return (currentIndex + 1) % INFORMATION_TABS.length;
      case 'ArrowLeft':
        return (currentIndex - 1 + INFORMATION_TABS.length) % INFORMATION_TABS.length;
      case 'Home':
        return 0;
      case 'End':
        return INFORMATION_TABS.length - 1;
      default:
        return null;
    }
  }
}
