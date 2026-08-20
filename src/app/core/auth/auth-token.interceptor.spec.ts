import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { MOCK_CUSTOMER_FIXTURE } from '@core/mock-api/fixtures';

import { AuthSessionStorage } from './auth-session.storage';
import { authTokenInterceptor } from './auth-token.interceptor';

describe('authTokenInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;
  let sessionStorage: AuthSessionStorage;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authTokenInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
    sessionStorage = TestBed.inject(AuthSessionStorage);
    sessionStorage.set(
      {
        accessToken: 'mock-token-customer-demo',
        expiresAt: new Date(Date.now() + 60_000).toISOString(),
        customer: MOCK_CUSTOMER_FIXTURE,
      },
      false,
    );
  });

  afterEach(() => {
    sessionStorage.clear();
    httpTesting.verify();
  });

  it('should attach the session token to mock API requests', () => {
    http.get('/api/orders').subscribe();

    expect(httpTesting.expectOne('/api/orders').request.headers.get('Authorization')).toBe(
      'Bearer mock-token-customer-demo',
    );
  });

  it('should not leak the session token to asset requests', () => {
    http.get('/assets/config.json').subscribe();

    expect(httpTesting.expectOne('/assets/config.json').request.headers.has('Authorization')).toBe(
      false,
    );
  });
});
