import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, type Observable } from 'rxjs';

import {
  API_ENDPOINTS,
  type AuthResponse,
  type LoginRequest,
  type RegisterRequest,
} from '@core/api';
import type { AuthSession } from '@core/api';

import { apiUrl } from '../http/api-url';

@Injectable({ providedIn: 'root' })
export class AuthRepository {
  private readonly http = inject(HttpClient);

  login(request: LoginRequest): Observable<AuthSession> {
    return this.http
      .post<AuthResponse>(apiUrl(API_ENDPOINTS.auth.login), request)
      .pipe(map(({ data }) => data));
  }

  register(request: RegisterRequest): Observable<AuthSession> {
    return this.http
      .post<AuthResponse>(apiUrl(API_ENDPOINTS.auth.register), request)
      .pipe(map(({ data }) => data));
  }

  getSession(): Observable<AuthSession> {
    return this.http
      .get<AuthResponse>(apiUrl(API_ENDPOINTS.auth.session))
      .pipe(map(({ data }) => data));
  }

  logout(): Observable<void> {
    return this.http.post<void>(apiUrl(API_ENDPOINTS.auth.logout), undefined);
  }
}
