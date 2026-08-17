import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import type { Product } from '@core/domain';
import { ProductCard } from '@shared/ui';

@Component({
  selector: 'app-related-products',
  imports: [ProductCard],
  templateUrl: './related-products.html',
  styleUrl: './related-products.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RelatedProducts {
  readonly products = input.required<readonly Product[]>();
  readonly heading = input('Related products');
}
