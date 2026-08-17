import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';

import type { ProductImage } from '@core/domain';

@Component({
  selector: 'app-product-gallery',
  templateUrl: './product-gallery.html',
  styleUrl: './product-gallery.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductGallery {
  readonly images = input.required<readonly ProductImage[]>();
  readonly productName = input.required<string>();

  protected readonly selectedIndex = signal(0);
  protected readonly selectedImage = computed(
    () => this.images()[this.selectedIndex()] ?? this.images()[0] ?? null,
  );

  protected selectImage(index: number): void {
    if (index >= 0 && index < this.images().length) {
      this.selectedIndex.set(index);
    }
  }

  protected showPrevious(): void {
    const imageCount = this.images().length;

    if (imageCount > 1) {
      this.selectedIndex.update((index) => (index - 1 + imageCount) % imageCount);
    }
  }

  protected showNext(): void {
    const imageCount = this.images().length;

    if (imageCount > 1) {
      this.selectedIndex.update((index) => (index + 1) % imageCount);
    }
  }
}
