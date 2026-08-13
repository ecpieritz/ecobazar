import { TestBed } from '@angular/core/testing';

import { Rating } from './rating';

describe('Rating', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Rating] }).compileComponents();
  });

  it('renders a fractional rating and review count accessibly', () => {
    const fixture = TestBed.createComponent(Rating);
    fixture.componentRef.setInput('value', 4.5);
    fixture.componentRef.setInput('count', 12);
    fixture.detectChanges();

    const element = fixture.nativeElement.querySelector('.rating') as HTMLElement;
    const fill = fixture.nativeElement.querySelector('.rating__fill') as HTMLElement;
    expect(element.getAttribute('aria-label')).toBe('Rated 4.5 out of 5 stars from 12 reviews');
    expect(fill.style.width).toBe('90%');
    expect(element.textContent).toContain('(12)');
  });

  it('clamps values to the configured range', () => {
    const fixture = TestBed.createComponent(Rating);
    fixture.componentRef.setInput('value', 8);
    fixture.componentRef.setInput('showCount', false);
    fixture.detectChanges();

    const element = fixture.nativeElement.querySelector('.rating') as HTMLElement;
    const fill = fixture.nativeElement.querySelector('.rating__fill') as HTMLElement;
    expect(element.getAttribute('aria-label')).toBe('Rated 5.0 out of 5 stars');
    expect(fill.style.width).toBe('100%');
    expect(fixture.nativeElement.querySelector('.rating__count')).toBeNull();
  });
});
