import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, map, of, startWith } from 'rxjs';

import { CategoryRepository } from '@core/data-access';
import type { ProductCategory } from '@core/domain';
import { toSignal } from '@angular/core/rxjs-interop';

type CategoriesState =
  | { readonly status: 'loading'; readonly categories: readonly ProductCategory[] }
  | { readonly status: 'success'; readonly categories: readonly ProductCategory[] }
  | { readonly status: 'error'; readonly categories: readonly ProductCategory[] };

@Component({
  selector: 'app-popular-categories',
  imports: [RouterLink],
  templateUrl: './popular-categories.html',
  styleUrl: './popular-categories.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PopularCategories {
  private readonly categoryRepository = inject(CategoryRepository);

  protected readonly state = toSignal(
    this.categoryRepository.getCategories().pipe(
      map((categories): CategoriesState => ({
        status: 'success',
        categories,
      })),
      startWith<CategoriesState>({ status: 'loading', categories: [] }),
      catchError(() => of<CategoriesState>({ status: 'error', categories: [] })),
    ),
    { requireSync: true },
  );
}
