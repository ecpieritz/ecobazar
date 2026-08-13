import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { HomePage } from './home-page';

describe('HomePage', () => {
  it('composes hero banners and store benefits', async () => {
    await TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-hero-banners')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-store-benefits')).toBeTruthy();
  });
});
