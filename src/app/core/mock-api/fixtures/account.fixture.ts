import type { Address, Customer, Order, OrderStatus, Product } from '@core/domain';

import { PRODUCTS_FIXTURE } from './products.fixture';

export const MOCK_CUSTOMER_ID = 'customer-demo';
export const MOCK_CUSTOMER_EMAIL = 'demo@ecobazar.com';
export const MOCK_CUSTOMER_PASSWORD = 'Password123!';

export const MOCK_BILLING_ADDRESS: Address = {
  id: 'address-billing-demo',
  type: 'billing',
  firstName: 'Dianne',
  lastName: 'Russell',
  company: 'Ecobazar Customer',
  street: '4140 Parker Road',
  city: 'Allentown',
  state: 'New Mexico',
  postalCode: '31134',
  country: 'United States',
  email: MOCK_CUSTOMER_EMAIL,
  phone: '(671) 555-0110',
  isDefault: true,
};

export const MOCK_CUSTOMER_FIXTURE: Customer = {
  id: MOCK_CUSTOMER_ID,
  email: MOCK_CUSTOMER_EMAIL,
  firstName: 'Dianne',
  lastName: 'Russell',
  phone: '(671) 555-0110',
  addresses: [MOCK_BILLING_ADDRESS],
  createdAt: '2025-01-15T10:00:00.000Z',
  updatedAt: '2026-08-01T10:00:00.000Z',
};

const money = (amount: number) => ({ amount, currency: 'USD' as const });
const statusSequence: readonly OrderStatus[] = [
  'received',
  'processing',
  'on-the-way',
  'delivered',
];

const orderItem = (product: Product, quantity: number) => ({
  productId: product.id,
  productName: product.name,
  productSlug: product.slug,
  sku: product.sku,
  image: product.images[0] ?? { src: '', alt: product.name },
  unitPrice: product.price,
  quantity,
  subtotal: money(Math.round(product.price.amount * quantity * 100) / 100),
});

const createOrder = (index: number): Order => {
  const first = PRODUCTS_FIXTURE[index % PRODUCTS_FIXTURE.length];
  const second = PRODUCTS_FIXTURE[(index + 4) % PRODUCTS_FIXTURE.length];
  const items = [orderItem(first, (index % 3) + 1), orderItem(second, 1)];
  const subtotal =
    Math.round(items.reduce((sum, item) => sum + item.subtotal.amount, 0) * 100) / 100;
  const discount = index % 3 === 0 ? 5 : 0;
  const shipping = subtotal >= 50 ? 0 : 5;
  const status = statusSequence[Math.min(index % 5, 3)];
  const placedAt = new Date(Date.UTC(2026, 7 - Math.floor(index / 4), 18 - (index % 12), 14, 0));
  const statusIndex = statusSequence.indexOf(status);

  return {
    id: `order-${String(4152 - index * 37)}`,
    customerId: MOCK_CUSTOMER_ID,
    items,
    billingAddress: MOCK_BILLING_ADDRESS,
    shippingAddress: { ...MOCK_BILLING_ADDRESS, id: `shipping-${index}`, type: 'shipping' },
    paymentMethod: index % 2 === 0 ? 'paypal' : 'cash-on-delivery',
    status,
    statusHistory: statusSequence.slice(0, statusIndex + 1).map((eventStatus, eventIndex) => ({
      status: eventStatus,
      occurredAt: new Date(placedAt.getTime() + eventIndex * 86_400_000).toISOString(),
    })),
    totals: {
      subtotal: money(subtotal),
      discount: money(discount),
      shipping: money(shipping),
      total: money(Math.round((subtotal - discount + shipping) * 100) / 100),
    },
    ...(discount ? { couponCode: 'SAVE5' } : {}),
    placedAt: placedAt.toISOString(),
    updatedAt: new Date(placedAt.getTime() + statusIndex * 86_400_000).toISOString(),
  };
};

export const MOCK_ORDERS_FIXTURE: readonly Order[] = Array.from({ length: 14 }, (_, index) =>
  createOrder(index),
);
