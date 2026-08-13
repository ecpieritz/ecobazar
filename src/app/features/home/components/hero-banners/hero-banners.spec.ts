import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { HeroBanners } from './hero-banners';

describe('HeroBanners', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroBanners],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('renders the primary promotion with an optimized hero image', () => {
    const fixture = TestBed.createComponent(HeroBanners);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const image = element.querySelector('.hero__primary img') as HTMLImageElement;

    expect(element.querySelector('h1')?.textContent).toContain('Fresh & Healthy Organic Food');
    expect(image.getAttribute('src')).toBe('/images/home/organic-grocery-hero.jpg');
    expect(image.getAttribute('fetchpriority')).toBe('high');
    expect(element.querySelector('.hero__button')?.getAttribute('href')).toBe('/shop');
  });

  it('renders two secondary promotions with catalog links', () => {
    const fixture = TestBed.createComponent(HeroBanners);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const promotions = element.querySelectorAll('.promo');
    const promotionImages = element.querySelectorAll<HTMLImageElement>('.promo__image');

    expect(promotions).toHaveLength(2);
    expect(promotionImages).toHaveLength(2);
    expect(promotionImages[0]?.getAttribute('src')).toBe('/images/home/summer-sale-produce.jpg');
    expect(promotionImages[1]?.getAttribute('src')).toBe('/images/home/best-deal-leaves.jpg');
    expect([...promotionImages].every((image) => image.getAttribute('loading') === 'lazy')).toBe(
      true,
    );
    expect(promotions[0]?.querySelector('a')?.getAttribute('href')).toContain('/shop?sale=true');
    expect(promotions[1]?.querySelector('a')?.getAttribute('href')).toContain(
      '/shop?featured=true',
    );
  });
});
