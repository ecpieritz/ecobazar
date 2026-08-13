import { ChangeDetectionStrategy, Component } from '@angular/core';

interface StoreBenefit {
  readonly icon: 'delivery' | 'headset' | 'payment' | 'package';
  readonly title: string;
  readonly description: string;
}

@Component({
  selector: 'app-store-benefits',
  templateUrl: './store-benefits.html',
  styleUrl: './store-benefits.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoreBenefits {
  protected readonly benefits: readonly StoreBenefit[] = [
    {
      icon: 'delivery',
      title: 'Free shipping',
      description: 'Free shipping on all your orders',
    },
    {
      icon: 'headset',
      title: 'Customer support 24/7',
      description: 'Instant access to dedicated support',
    },
    {
      icon: 'payment',
      title: '100% secure payment',
      description: 'Your payment information stays safe',
    },
    {
      icon: 'package',
      title: 'Money-back guarantee',
      description: '30-day money-back guarantee',
    },
  ];
}
