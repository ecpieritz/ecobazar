import { computed, inject, Injectable, signal } from '@angular/core';

import type { AuthSession } from '@core/api';
import { createPersistenceKey, LocalStorageService } from '@core/persistence';

const AUTH_SESSION_KEY = createPersistenceKey<AuthSession>('auth-session');

const isValidSession = (session: AuthSession | null): session is AuthSession =>
  session !== null &&
  typeof session.accessToken === 'string' &&
  Date.parse(session.expiresAt) > Date.now() &&
  typeof session.customer?.id === 'string';

@Injectable({ providedIn: 'root' })
export class AuthSessionStorage {
  private readonly storage = inject(LocalStorageService);
  private readonly state = signal<AuthSession | null>(this.restore());

  readonly session = computed(() => this.state());
  readonly accessToken = computed(() => this.state()?.accessToken ?? null);

  set(session: AuthSession, persist: boolean): void {
    this.state.set(session);
    if (persist) this.storage.set(AUTH_SESSION_KEY, session);
    else this.storage.remove(AUTH_SESSION_KEY);
  }

  update(session: AuthSession): void {
    const persisted = this.storage.has(AUTH_SESSION_KEY);
    this.set(session, persisted);
  }

  clear(): void {
    this.state.set(null);
    this.storage.remove(AUTH_SESSION_KEY);
  }

  private restore(): AuthSession | null {
    const session = this.storage.get(AUTH_SESSION_KEY);
    if (isValidSession(session)) return session;
    this.storage.remove(AUTH_SESSION_KEY);
    return null;
  }
}
