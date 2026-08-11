import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-about-page',
  template: `
    <main class="container">
      <h1>About us</h1>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutPage {}
