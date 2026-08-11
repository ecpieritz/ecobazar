import { Customer, IsoDateString } from '@core/domain';

import { ApiResponse } from './api.contracts';

export interface LoginRequest {
  readonly email: string;
  readonly password: string;
  readonly rememberMe: boolean;
}

export interface RegisterRequest {
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly password: string;
  readonly acceptedTerms: boolean;
}

export interface AuthSession {
  readonly accessToken: string;
  readonly expiresAt: IsoDateString;
  readonly customer: Customer;
}

export type AuthResponse = ApiResponse<AuthSession>;
