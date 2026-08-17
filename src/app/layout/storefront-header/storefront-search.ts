import { ChangeDetectionStrategy, Component, input, linkedSignal, output } from '@angular/core';

@Component({
  selector: 'app-storefront-search',
  templateUrl: './storefront-search.html',
  styleUrl: './storefront-search.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StorefrontSearch {
  readonly controlId = input.required<string>();
  readonly initialQuery = input('');
  readonly searchSubmitted = output<string>();

  protected readonly query = linkedSignal(() => this.initialQuery());

  protected submit(event: SubmitEvent): void {
    event.preventDefault();
    const data = new FormData(event.currentTarget as HTMLFormElement);
    const query = String(data.get('search') ?? '').trim();

    this.query.set(query);
    this.searchSubmitted.emit(query);
  }

  protected updateQuery(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  protected clear(): void {
    this.query.set('');
    this.searchSubmitted.emit('');
  }
}
