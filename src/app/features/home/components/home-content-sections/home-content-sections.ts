import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

interface Testimonial {
  readonly quote: string;
  readonly name: string;
  readonly role: string;
  readonly initials: string;
  readonly rating: number;
}

interface Partner {
  readonly name: string;
  readonly accent: string;
}

interface LatestArticle {
  readonly title: string;
  readonly excerpt: string;
  readonly category: string;
  readonly publishedAt: string;
  readonly image: {
    readonly src: string;
    readonly alt: string;
  };
}

@Component({
  selector: 'app-home-content-sections',
  imports: [DatePipe],
  templateUrl: './home-content-sections.html',
  styleUrl: './home-content-sections.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeContentSections {
  protected readonly testimonials: readonly Testimonial[] = [
    {
      quote:
        'The produce always arrives crisp and beautifully packed. Ecobazar has made our weekly grocery routine much simpler.',
      name: 'Jenny Wilson',
      role: 'Verified customer',
      initials: 'JW',
      rating: 5,
    },
    {
      quote:
        'I love knowing exactly what is in season. The quality is consistently excellent, and delivery has always been reliable.',
      name: 'Guy Hawkins',
      role: 'Verified customer',
      initials: 'GH',
      rating: 5,
    },
    {
      quote:
        'Fresh vegetables, fair prices, and genuinely helpful support. It feels like shopping at a trusted neighborhood market.',
      name: 'Kathryn Murphy',
      role: 'Verified customer',
      initials: 'KM',
      rating: 5,
    },
  ];

  protected readonly partners: readonly Partner[] = [
    { name: 'Greenfield', accent: 'leaf' },
    { name: 'Harvest', accent: 'sun' },
    { name: 'Farmary', accent: 'sprout' },
    { name: 'Freshco', accent: 'fruit' },
    { name: 'Organica', accent: 'organic' },
    { name: 'Rooted', accent: 'root' },
  ];

  protected readonly latestArticles: readonly LatestArticle[] = [
    {
      title: 'A simple guide to choosing seasonal produce',
      excerpt:
        'Learn what to look for at the market and enjoy fruit and vegetables at their freshest.',
      category: 'Seasonal guide',
      publishedAt: '2026-08-09T09:00:00.000Z',
      image: {
        src: '/images/articles/seasonal-produce.jpg',
        alt: 'Seasonal fruit and vegetables arranged on a kitchen table',
      },
    },
    {
      title: 'How to keep vegetables fresh for longer',
      excerpt:
        'Practical storage habits that help reduce waste while preserving flavor and texture.',
      category: 'Kitchen tips',
      publishedAt: '2026-08-05T09:00:00.000Z',
      image: {
        src: '/images/articles/keep-vegetables-fresh.jpg',
        alt: 'Fresh vegetables being organized into produce containers',
      },
    },
    {
      title: 'Why supporting organic farms matters',
      excerpt:
        'Discover how mindful growing practices can support healthy soil and resilient communities.',
      category: 'Sustainability',
      publishedAt: '2026-07-30T09:00:00.000Z',
      image: {
        src: '/images/articles/organic-farming.jpg',
        alt: 'Organic farmer carrying a crate of freshly harvested vegetables',
      },
    },
  ];
}
