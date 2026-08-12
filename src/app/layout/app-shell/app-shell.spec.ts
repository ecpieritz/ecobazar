import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router, RouterOutlet } from '@angular/router';

import { BreadcrumbBanner } from '../breadcrumb-banner/breadcrumb-banner';
import { breadcrumbRouteData } from '../breadcrumb-banner/breadcrumb-item';
import { NewsletterSignup } from '../newsletter-signup/newsletter-signup';
import { StorefrontFooter } from '../storefront-footer/storefront-footer';
import { AppShell } from './app-shell';
import { StorefrontHeader } from '../storefront-header/storefront-header';

@Component({ template: '' })
class TestPage {}

describe('AppShell', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppShell],
      providers: [
        provideRouter([
          { path: '', component: TestPage },
          {
            path: 'orders',
            component: TestPage,
            data: breadcrumbRouteData(
              { label: 'Account', route: '/account' },
              { label: 'Order History' },
            ),
          },
        ]),
      ],
    }).compileComponents();
  });

  it('should create the shell with the storefront header and a router outlet', () => {
    const fixture = TestBed.createComponent(AppShell);

    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.debugElement.query(By.directive(StorefrontHeader))).toBeTruthy();
    expect(fixture.debugElement.query(By.directive(RouterOutlet))).toBeTruthy();
    expect(fixture.debugElement.query(By.directive(NewsletterSignup))).toBeTruthy();
    expect(fixture.debugElement.query(By.directive(StorefrontFooter))).toBeTruthy();
  });

  it('should render breadcrumbs from the active route and hide them on routes without metadata', async () => {
    const fixture = TestBed.createComponent(AppShell);
    const router = TestBed.inject(Router);

    await router.navigateByUrl('/orders');
    fixture.detectChanges();

    const banner = fixture.debugElement.query(By.directive(BreadcrumbBanner));
    expect(banner).toBeTruthy();
    expect((banner.nativeElement as HTMLElement).textContent).toContain('Order History');

    await router.navigateByUrl('/');
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.directive(BreadcrumbBanner))).toBeNull();
  });
});
