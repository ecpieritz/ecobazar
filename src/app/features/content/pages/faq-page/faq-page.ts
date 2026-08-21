import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

@Component({
  selector: 'app-faq-page',
  templateUrl: './faq-page.html',
  styleUrl: './faq-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FaqPage {
  protected readonly openQuestion = signal<number | null>(0);
  protected readonly questions = [
    {
      question: 'How does the mocked checkout work?',
      answer:
        'Products, totals, coupons, payment choices, and order creation are handled entirely in the browser through a typed mock API. No real payment is processed.',
    },
    {
      question: 'Are the products and prices real?',
      answer:
        'The catalog is fixture data created for this Angular demonstration. Prices, inventory, discounts, and reviews are simulated.',
    },
    {
      question: 'Can I create an account?',
      answer:
        'Yes. Registration and sign-in are mocked, and the session can be persisted locally so you can explore protected account pages.',
    },
    {
      question: 'Where can I find my orders?',
      answer:
        'After signing in, open My Account and choose Order History. Newly placed orders are available there during the current mock API session.',
    },
    {
      question: 'How are shipping costs calculated?',
      answer:
        'Standard shipping is five dollars. Orders that meet the configured free-shipping threshold are delivered for free.',
    },
    {
      question: 'Which coupon codes can I test?',
      answer:
        'Use FRESH10 for ten percent off eligible orders or SAVE5 for a fixed five-dollar discount when the minimum subtotal is met.',
    },
    {
      question: 'Does the storefront support mobile devices?',
      answer:
        'Yes. Navigation, product grids, drawers, forms, tables, and account pages adapt across phone, tablet, and desktop breakpoints.',
    },
    {
      question: 'Is this connected to a real backend?',
      answer:
        'No. Ecobazar is a frontend portfolio project focused on modern Angular, strict TypeScript, signals, reactive forms, and accessible UI patterns.',
    },
  ] as const;

  protected toggleQuestion(index: number, event: Event): void {
    event.preventDefault();
    this.openQuestion.update((current) => (current === index ? null : index));
  }
}
