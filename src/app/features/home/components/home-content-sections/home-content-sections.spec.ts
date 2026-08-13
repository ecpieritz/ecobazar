import { TestBed } from '@angular/core/testing';

import { HomeContentSections } from './home-content-sections';

describe('HomeContentSections', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HomeContentSections] }).compileComponents();
  });

  it('renders accessible customer testimonials', () => {
    const fixture = TestBed.createComponent(HomeContentSections);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelectorAll('.testimonial-card')).toHaveLength(3);
    expect(element.querySelectorAll('blockquote')).toHaveLength(3);
    expect(
      element.querySelectorAll('.testimonial-card__rating[aria-label="5 out of 5 stars"]'),
    ).toHaveLength(3);
  });

  it('renders the trusted partner list', () => {
    const fixture = TestBed.createComponent(HomeContentSections);
    fixture.detectChanges();
    const partners = fixture.nativeElement.querySelectorAll(
      '.partners li',
    ) as NodeListOf<HTMLElement>;

    expect(partners).toHaveLength(6);
    expect(partners[0]?.textContent).toContain('Greenfield');
    expect(partners[5]?.textContent).toContain('Rooted');
  });

  it('renders dated article cards with lazy-loaded editorial images', () => {
    const fixture = TestBed.createComponent(HomeContentSections);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const articles = element.querySelectorAll('.article-card');
    const images = element.querySelectorAll<HTMLImageElement>('.article-card img');

    expect(articles).toHaveLength(3);
    expect(element.querySelectorAll('.article-card time[datetime]')).toHaveLength(3);
    expect(Array.from(images).every((image) => image.getAttribute('loading') === 'lazy')).toBe(
      true,
    );
    expect(articles[0]?.textContent).toContain('A simple guide to choosing seasonal produce');
  });
});
