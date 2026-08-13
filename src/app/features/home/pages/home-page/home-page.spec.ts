import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { CategoryRepository } from '@core/data-access';

import { HomePage } from './home-page';

describe('HomePage', () => {
  it('composes hero banners, store benefits, and popular categories', async () => {
    await TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [
        provideRouter([]),
        { provide: CategoryRepository, useValue: { getCategories: () => of([]) } },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-hero-banners')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-store-benefits')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-popular-categories')).toBeTruthy();
  });
});
