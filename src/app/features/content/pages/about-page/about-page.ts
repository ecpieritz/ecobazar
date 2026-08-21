import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-about-page',
  templateUrl: './about-page.html',
  styleUrl: './about-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutPage {
  protected readonly benefits = [
    { icon: 'leaf', title: '100% Organic', text: 'Fresh food sourced from trusted growers.' },
    { icon: 'headset', title: 'Support 24/7', text: 'Helpful people whenever you need us.' },
    { icon: 'shield', title: 'Secure checkout', text: 'A safe and transparent shopping flow.' },
    { icon: 'truck', title: 'Fast delivery', text: 'Careful delivery that keeps produce fresh.' },
  ] as const;
  protected readonly team = [
    { name: 'Jenny Wilson', role: 'Founder & CEO', image: '/images/home/newsletter-promotion.jpg' },
    {
      name: 'Jane Cooper',
      role: 'Farm partnerships',
      image: '/images/articles/organic-farming.jpg',
    },
    {
      name: 'Robert Fox',
      role: 'Customer experience',
      image: '/images/home/organic-grocery-hero.jpg',
    },
  ] as const;
  protected readonly testimonials = [
    {
      quote: 'The produce feels genuinely fresh and the ordering experience is effortless.',
      name: 'Dianne Russell',
    },
    {
      quote: 'Clear prices, thoughtful delivery, and quality I can count on every week.',
      name: 'Eleanor Pena',
    },
    {
      quote: 'Ecobazar makes choosing seasonal food simple for our whole family.',
      name: 'Robert Fox',
    },
  ] as const;
  protected readonly partners = [
    'Fresh Farm',
    'Greenly',
    'Harvest Co.',
    'Organic Roots',
    'Good Food',
  ];
}
