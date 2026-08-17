import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';

import type { Product, ProductReview } from '@core/domain';
import { Rating } from '@shared/ui';

type ProductInformationTab = 'description' | 'details' | 'reviews';

@Component({
  selector: 'app-product-information',
  imports: [DatePipe, Rating],
  templateUrl: './product-information.html',
  styleUrl: './product-information.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductInformation {
  readonly product = input.required<Product>();
  readonly categoryName = input.required<string>();
  readonly reviews = input<readonly ProductReview[]>([]);

  protected readonly activeTab = signal<ProductInformationTab>('description');

  protected selectTab(tab: ProductInformationTab): void {
    this.activeTab.set(tab);
  }
}
