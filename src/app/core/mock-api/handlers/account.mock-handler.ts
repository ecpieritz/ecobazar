import { HttpRequest } from '@angular/common/http';

import type {
  AddressPayload,
  AuthResponse,
  ChangePasswordRequest,
  CustomerResponse,
  LoginRequest,
  OrderListResponse,
  OrderResponse,
  PlaceOrderRequest,
  RegisterRequest,
  UpdateCustomerRequest,
} from '@core/api';
import type { Address, Customer, Order, OrderItem, PaymentMethod } from '@core/domain';
import { calculateCouponDiscount, calculateShipping, findMockCoupon } from '@core/state';

import {
  MOCK_BILLING_ADDRESS,
  MOCK_CUSTOMER_EMAIL,
  MOCK_CUSTOMER_FIXTURE,
  MOCK_CUSTOMER_PASSWORD,
  MOCK_ORDERS_FIXTURE,
  PRODUCTS_FIXTURE,
} from '../fixtures';
import { mockErrorResponse, mockJsonResponse, type MockApiResult } from '../http/mock-api-response';

let customer: Customer = structuredClone(MOCK_CUSTOMER_FIXTURE);
let password = MOCK_CUSTOMER_PASSWORD;
const orders: Order[] = structuredClone([...MOCK_ORDERS_FIXTURE]);

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

const roundCurrency = (amount: number): number => Math.round((amount + Number.EPSILON) * 100) / 100;
const money = (amount: number) => ({ amount: roundCurrency(amount), currency: 'USD' as const });
const PAYMENT_METHODS: readonly PaymentMethod[] = ['cash-on-delivery', 'paypal', 'amazon-pay'];
const ADDRESS_FIELDS = [
  'firstName',
  'lastName',
  'street',
  'city',
  'state',
  'postalCode',
  'country',
  'email',
  'phone',
] as const;

const placeOrder = (request: HttpRequest<unknown>): MockApiResult => {
  const body = request.body as PlaceOrderRequest;
  if (!Array.isArray(body?.items) || body.items.length === 0) {
    return mockErrorResponse(request, 400, 'EMPTY_ORDER', 'Add at least one product to the order.');
  }
  if (
    !body.billingAddress ||
    !body.shippingAddress ||
    ADDRESS_FIELDS.some(
      (field) => !body.billingAddress[field]?.trim() || !body.shippingAddress[field]?.trim(),
    )
  ) {
    return mockErrorResponse(
      request,
      422,
      'INVALID_ADDRESS',
      'Billing and shipping addresses must be complete.',
    );
  }
  if (!PAYMENT_METHODS.includes(body.paymentMethod)) {
    return mockErrorResponse(
      request,
      422,
      'INVALID_PAYMENT_METHOD',
      'Select a supported payment method.',
    );
  }

  const items: OrderItem[] = [];
  for (const requestedItem of body.items) {
    const product = PRODUCTS_FIXTURE.find(({ id }) => id === requestedItem.productId);
    if (!product) {
      return mockErrorResponse(request, 404, 'PRODUCT_NOT_FOUND', 'A product was not found.');
    }
    if (!Number.isInteger(requestedItem.quantity) || requestedItem.quantity <= 0) {
      return mockErrorResponse(
        request,
        422,
        'INVALID_QUANTITY',
        `Select a valid quantity for ${product.name}.`,
      );
    }
    if (
      product.inventory.status === 'out-of-stock' ||
      requestedItem.quantity > product.inventory.quantity
    ) {
      return mockErrorResponse(
        request,
        409,
        'STOCK_UNAVAILABLE',
        `${product.name} no longer has the requested quantity in stock.`,
      );
    }
    items.push({
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      sku: product.sku,
      image: product.images[0] ?? { src: '', alt: product.name },
      unitPrice: product.price,
      quantity: requestedItem.quantity,
      subtotal: money(product.price.amount * requestedItem.quantity),
    });
  }

  const subtotal = roundCurrency(items.reduce((total, item) => total + item.subtotal.amount, 0));
  const coupon = findMockCoupon(body.couponCode);
  const discount = roundCurrency(calculateCouponDiscount(subtotal, coupon));
  const shipping = roundCurrency(calculateShipping(subtotal));
  const now = new Date().toISOString();
  const order: Order = {
    id: `order-${Date.now()}`,
    customerId: customer.id,
    items,
    billingAddress: {
      id: `billing-${Date.now()}`,
      type: 'billing',
      ...body.billingAddress,
      isDefault: false,
    },
    shippingAddress: {
      id: `shipping-${Date.now()}`,
      type: 'shipping',
      ...body.shippingAddress,
      isDefault: false,
    },
    paymentMethod: body.paymentMethod,
    status: 'received',
    statusHistory: [{ status: 'received', occurredAt: now }],
    totals: {
      subtotal: money(subtotal),
      discount: money(discount),
      shipping: money(shipping),
      total: money(Math.max(0, subtotal - discount) + shipping),
    },
    ...(coupon ? { couponCode: coupon.code } : {}),
    ...(body.notes?.trim() ? { notes: body.notes.trim() } : {}),
    placedAt: now,
    updatedAt: now,
  };
  orders.unshift(order);
  return mockJsonResponse<OrderResponse>(request, { data: order }, 201);
};

const handleOrders = (
  request: HttpRequest<unknown>,
  url: URL,
  segments: readonly string[],
): MockApiResult => {
  if (!authenticated(request)) return unauthorized(request);

  if (segments.length === 1 && request.method === 'POST') return placeOrder(request);
  if (request.method !== 'GET') return methodNotAllowed(request);

  const customerOrders = orders.filter(({ customerId }) => customerId === customer.id);

  if (segments.length === 1) {
    const page = positiveInteger(url, 'page', 1);
    const pageSize = Math.min(positiveInteger(url, 'pageSize', 10), 50);
    const start = (page - 1) * pageSize;
    const body: OrderListResponse = {
      data: customerOrders.slice(start, start + pageSize),
      pagination: {
        page,
        pageSize,
        totalItems: customerOrders.length,
        totalPages: Math.ceil(customerOrders.length / pageSize),
      },
    };
    return mockJsonResponse(request, body);
  }

  const order = customerOrders.find(({ id }) => id === segments[1]);
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
