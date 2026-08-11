import { Address, Customer } from '@core/domain';

import { ApiResponse } from './api.contracts';

export interface AddressPayload {
  readonly firstName: string;
  readonly lastName: string;
  readonly company?: string;
  readonly street: string;
  readonly city: string;
  readonly state: string;
  readonly postalCode: string;
  readonly country: string;
  readonly email: string;
  readonly phone: string;
}

export interface UpdateCustomerRequest {
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly phone?: string;
  readonly avatarUrl?: string;
}

export interface ChangePasswordRequest {
  readonly currentPassword: string;
  readonly newPassword: string;
}

export type CustomerResponse = ApiResponse<Customer>;
export type AddressResponse = ApiResponse<Address>;
