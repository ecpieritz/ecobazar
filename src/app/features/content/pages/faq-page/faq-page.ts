import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-faq-page',
  template: `
    <main class="container">
      <h1>Frequently asked questions</h1>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FaqPage {}
