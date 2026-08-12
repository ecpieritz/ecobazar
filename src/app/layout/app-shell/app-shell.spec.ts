import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, RouterOutlet } from '@angular/router';

import { AppShell } from './app-shell';
import { StorefrontHeader } from '../storefront-header/storefront-header';

describe('AppShell', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppShell],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create the shell with the storefront header and a router outlet', () => {
    const fixture = TestBed.createComponent(AppShell);

    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.debugElement.query(By.directive(StorefrontHeader))).toBeTruthy();
    expect(fixture.debugElement.query(By.directive(RouterOutlet))).toBeTruthy();
  });
});
