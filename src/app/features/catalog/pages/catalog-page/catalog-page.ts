import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-catalog-page',
  template: `
    <main class="container">
      <h1>Shop</h1>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogPage {}
