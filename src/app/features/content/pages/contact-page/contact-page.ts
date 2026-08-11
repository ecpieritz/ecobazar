import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-contact-page',
  template: `
    <main class="container">
      <h1>Contact us</h1>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactPage {}
