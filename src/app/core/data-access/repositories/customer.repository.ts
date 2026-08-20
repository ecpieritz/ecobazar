import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, type Observable } from 'rxjs';

import {
  API_ENDPOINTS,
  type AddressPayload,
  type AddressResponse,
  type ChangePasswordRequest,
  type CustomerResponse,
  type UpdateCustomerRequest,
} from '@core/api';
import type { Address, Customer } from '@core/domain';

import { apiUrl } from '../http/api-url';

@Injectable({ providedIn: 'root' })
export class CustomerRepository {
  private readonly http = inject(HttpClient);

  getProfile(): Observable<Customer> {
    return this.http
      .get<CustomerResponse>(apiUrl(API_ENDPOINTS.customers.profile))
      .pipe(map(({ data }) => data));
  }

  updateProfile(request: UpdateCustomerRequest): Observable<Customer> {
    return this.http
      .put<CustomerResponse>(apiUrl(API_ENDPOINTS.customers.profile), request)
      .pipe(map(({ data }) => data));
  }

  updateAddress(addressId: string, request: AddressPayload): Observable<Address> {
    return this.http
      .put<AddressResponse>(apiUrl(API_ENDPOINTS.customers.address(addressId)), request)
      .pipe(map(({ data }) => data));
  }

  changePassword(request: ChangePasswordRequest): Observable<void> {
    return this.http.put<void>(apiUrl(API_ENDPOINTS.customers.password), request);
  }
}
