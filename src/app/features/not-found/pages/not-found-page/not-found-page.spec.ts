import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { NotFoundPage } from './not-found-page';

describe('NotFoundPage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotFoundPage],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should provide a clear recovery path to the storefront', () => {
    const fixture = TestBed.createComponent(NotFoundPage);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('h1')?.textContent).toContain('Page not found');
    expect(element.querySelector('a')?.getAttribute('href')).toBe('/');
    expect(element.querySelector('svg text')?.textContent).toBe('404');
  });
});
