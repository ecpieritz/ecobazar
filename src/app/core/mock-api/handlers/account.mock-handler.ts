import { HttpRequest } from '@angular/common/http';

import type {
  AddressPayload,
  AuthResponse,
  ChangePasswordRequest,
  CustomerResponse,
  LoginRequest,
  OrderListResponse,
  OrderResponse,
  RegisterRequest,
  UpdateCustomerRequest,
} from '@core/api';
import type { Address, Customer } from '@core/domain';

import {
  MOCK_BILLING_ADDRESS,
  MOCK_CUSTOMER_EMAIL,
  MOCK_CUSTOMER_FIXTURE,
  MOCK_CUSTOMER_PASSWORD,
  MOCK_ORDERS_FIXTURE,
} from '../fixtures';
import { mockErrorResponse, mockJsonResponse, type MockApiResult } from '../http/mock-api-response';

let customer: Customer = structuredClone(MOCK_CUSTOMER_FIXTURE);
let password = MOCK_CUSTOMER_PASSWORD;

const decodeSegment = (value: string): string => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const authenticated = (request: HttpRequest<unknown>): boolean =>
  request.headers.get('Authorization')?.startsWith('Bearer mock-token-') ?? false;

const unauthorized = (request: HttpRequest<unknown>): MockApiResult =>
  mockErrorResponse(request, 401, 'UNAUTHORIZED', 'A valid mock session is required.');

const methodNotAllowed = (request: HttpRequest<unknown>): MockApiResult =>
  mockErrorResponse(
    request,
    405,
    'METHOD_NOT_ALLOWED',
    `${request.method} is not supported for this endpoint.`,
  );

const session = (): AuthResponse => ({
  data: {
    accessToken: `mock-token-${customer.id}`,
    expiresAt: new Date(Date.now() + 7 * 86_400_000).toISOString(),
    customer,
  },
});

const handleAuth = (request: HttpRequest<unknown>, segments: readonly string[]): MockApiResult => {
  const action = segments[1];

  if (action === 'login') {
    if (request.method !== 'POST') return methodNotAllowed(request);
    const body = request.body as LoginRequest;
    if (
      body?.email.trim().toLowerCase() !== customer.email.toLowerCase() ||
      body?.password !== password
    ) {
      return mockErrorResponse(
        request,
        401,
        'INVALID_CREDENTIALS',
        'Email or password is incorrect.',
      );
    }
    return mockJsonResponse(request, session());
  }

  if (action === 'register') {
    if (request.method !== 'POST') return methodNotAllowed(request);
    const body = request.body as RegisterRequest;
    if (!body?.acceptedTerms)
      return mockErrorResponse(request, 400, 'TERMS_REQUIRED', 'Terms must be accepted.');
    if (body.email.trim().toLowerCase() === MOCK_CUSTOMER_EMAIL)
      return mockErrorResponse(request, 409, 'EMAIL_IN_USE', 'An account already uses this email.');
    const now = new Date().toISOString();
    customer = {
      id: `customer-${Date.now()}`,
      firstName: body.firstName.trim(),
      lastName: body.lastName.trim(),
      email: body.email.trim().toLowerCase(),
      addresses: [],
      createdAt: now,
      updatedAt: now,
    };
    password = body.password;
    return mockJsonResponse(request, session(), 201);
  }

  if (action === 'session') {
    if (request.method !== 'GET') return methodNotAllowed(request);
    return authenticated(request) ? mockJsonResponse(request, session()) : unauthorized(request);
  }

  if (action === 'logout') {
    if (request.method !== 'POST') return methodNotAllowed(request);
    return mockJsonResponse(request, { data: null });
  }

  return mockErrorResponse(request, 404, 'ROUTE_NOT_FOUND', 'Authentication route was not found.');
};

const handleCustomer = (
  request: HttpRequest<unknown>,
  segments: readonly string[],
): MockApiResult => {
  if (!authenticated(request)) return unauthorized(request);

  if (segments.length === 2) {
    if (request.method === 'GET')
      return mockJsonResponse<CustomerResponse>(request, { data: customer });
    if (request.method === 'PUT') {
      const body = request.body as UpdateCustomerRequest;
      customer = {
        ...customer,
        ...body,
        email: body.email.trim().toLowerCase(),
        updatedAt: new Date().toISOString(),
      };
      return mockJsonResponse<CustomerResponse>(request, { data: customer });
    }
    return methodNotAllowed(request);
  }

  if (segments[2] === 'addresses') {
    if (request.method !== 'PUT') return methodNotAllowed(request);
    const body = request.body as AddressPayload;
    const addressId = segments[3] ?? customer.addresses[0]?.id ?? MOCK_BILLING_ADDRESS.id;
    const address: Address = { id: addressId, type: 'billing', ...body, isDefault: true };
    customer = { ...customer, addresses: [address], updatedAt: new Date().toISOString() };
    return mockJsonResponse(request, { data: address });
  }

  if (segments[2] === 'password') {
    if (request.method !== 'PUT') return methodNotAllowed(request);
    const body = request.body as ChangePasswordRequest;
    if (body?.currentPassword !== password)
      return mockErrorResponse(request, 400, 'INVALID_PASSWORD', 'Current password is incorrect.');
    password = body.newPassword;
    return mockJsonResponse(request, { data: null });
  }

  return mockErrorResponse(request, 404, 'ROUTE_NOT_FOUND', 'Customer route was not found.');
};

const positiveInteger = (url: URL, name: string, fallback: number): number => {
  const value = Number(url.searchParams.get(name) ?? fallback);
  return Number.isInteger(value) && value > 0 ? value : fallback;
};

const handleOrders = (
  request: HttpRequest<unknown>,
  url: URL,
  segments: readonly string[],
): MockApiResult => {
  if (!authenticated(request)) return unauthorized(request);
  if (request.method !== 'GET') return methodNotAllowed(request);

  if (segments.length === 1) {
    const page = positiveInteger(url, 'page', 1);
    const pageSize = Math.min(positiveInteger(url, 'pageSize', 10), 50);
    const start = (page - 1) * pageSize;
    const body: OrderListResponse = {
      data: MOCK_ORDERS_FIXTURE.slice(start, start + pageSize),
      pagination: {
        page,
        pageSize,
        totalItems: MOCK_ORDERS_FIXTURE.length,
        totalPages: Math.ceil(MOCK_ORDERS_FIXTURE.length / pageSize),
      },
    };
    return mockJsonResponse(request, body);
  }

  const order = MOCK_ORDERS_FIXTURE.find(({ id }) => id === segments[1]);
  if (!order) return mockErrorResponse(request, 404, 'ORDER_NOT_FOUND', 'Order was not found.');
  return mockJsonResponse<OrderResponse>(request, { data: order });
};

export const handleAccountRequest = (
  request: HttpRequest<unknown>,
  url: URL,
  apiPath: string,
): MockApiResult | null => {
  const segments = apiPath.split('/').filter(Boolean).map(decodeSegment);
  if (segments[0] === 'auth') return handleAuth(request, segments);
  if (segments[0] === 'customers' && segments[1] === 'me') return handleCustomer(request, segments);
  if (segments[0] === 'orders') return handleOrders(request, url, segments);
  return null;
};
