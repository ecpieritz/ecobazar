import { computed, inject, Injectable, signal } from '@angular/core';
import { finalize, tap, type Observable } from 'rxjs';

import type { AuthSession, LoginRequest, RegisterRequest } from '@core/api';
import { AuthRepository } from '@core/data-access';
import type { Customer } from '@core/domain';

import { AuthSessionStorage } from './auth-session.storage';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly repository = inject(AuthRepository);
  private readonly sessionStorage = inject(AuthSessionStorage);
  private readonly pending = signal(false);

  readonly session = this.sessionStorage.session;
  readonly customer = computed(() => this.session()?.customer ?? null);
  readonly isAuthenticated = computed(() => this.session() !== null);
  readonly isPending = computed(() => this.pending());

  login(request: LoginRequest): Observable<AuthSession> {
    this.pending.set(true);
    return this.repository.login(request).pipe(
      tap((session) => this.sessionStorage.set(session, request.rememberMe)),
      finalize(() => this.pending.set(false)),
    );
  }

  register(request: RegisterRequest): Observable<AuthSession> {
    this.pending.set(true);
    return this.repository.register(request).pipe(
      tap((session) => this.sessionStorage.set(session, true)),
      finalize(() => this.pending.set(false)),
    );
  }

  updateCustomer(customer: Customer): void {
    const session = this.session();
    if (session) this.sessionStorage.update({ ...session, customer });
  }

  logout(): void {
    this.sessionStorage.clear();
    this.repository.logout().subscribe({ error: () => undefined });
  }
}
