import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  numberAttribute,
} from '@angular/core';

export type RatingSize = 'small' | 'medium' | 'large';

@Component({
  selector: 'app-rating',
  templateUrl: './rating.html',
  styleUrl: './rating.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Rating {
  readonly value = input(0, { transform: numberAttribute });
  readonly count = input<number | null>(null);
  readonly max = input(5, { transform: numberAttribute });
  readonly size = input<RatingSize>('medium');
  readonly showCount = input(true);

  protected readonly normalizedMax = computed(() => Math.max(1, this.max()));
  protected readonly normalizedValue = computed(() =>
    Math.min(Math.max(this.value(), 0), this.normalizedMax()),
  );
  protected readonly fillPercentage = computed(
    () => `${(this.normalizedValue() / this.normalizedMax()) * 100}%`,
  );
  protected readonly stars = computed(() => '★'.repeat(this.normalizedMax()));
  protected readonly accessibleLabel = computed(() => {
    const rating = `${this.normalizedValue().toFixed(1)} out of ${this.normalizedMax()} stars`;
    const count = this.count();

    return count === null ? `Rated ${rating}` : `Rated ${rating} from ${count} reviews`;
  });
}
