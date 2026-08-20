import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';

import type { AuthSession } from '@core/api';
import { AuthRepository } from '@core/data-access';
import { MOCK_CUSTOMER_FIXTURE } from '@core/mock-api/fixtures';

import { AuthStore } from './auth.store';

describe('AuthStore', () => {
  const session: AuthSession = {
    accessToken: 'mock-token-customer-demo',
    expiresAt: new Date(Date.now() + 60_000).toISOString(),
    customer: MOCK_CUSTOMER_FIXTURE,
  };
  const repository = {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  };

  beforeEach(() => {
    repository.login.mockReset().mockReturnValue(of(session));
    repository.register.mockReset().mockReturnValue(of(session));
    repository.logout.mockReset().mockReturnValue(of(undefined));
    TestBed.configureTestingModule({
      providers: [AuthStore, { provide: AuthRepository, useValue: repository }],
    });
    TestBed.inject(AuthStore).logout();
    repository.logout.mockClear();
  });

  it('should authenticate and expose the active customer', async () => {
    const store = TestBed.inject(AuthStore);
    const request = {
      email: 'demo@ecobazar.com',
      password: 'Password123!',
      rememberMe: true,
    };

    await firstValueFrom(store.login(request));

    expect(repository.login).toHaveBeenCalledWith(request);
    expect(store.isAuthenticated()).toBe(true);
    expect(store.customer()?.id).toBe(MOCK_CUSTOMER_FIXTURE.id);
    expect(store.isPending()).toBe(false);
  });

  it('should register and clear the session on logout', async () => {
    const store = TestBed.inject(AuthStore);

    await firstValueFrom(
      store.register({
        firstName: 'Dianne',
        lastName: 'Russell',
        email: 'new@ecobazar.com',
        password: 'Password123!',
        acceptedTerms: true,
      }),
    );
    store.logout();

    expect(store.isAuthenticated()).toBe(false);
    expect(repository.logout).toHaveBeenCalledOnce();
  });
});
