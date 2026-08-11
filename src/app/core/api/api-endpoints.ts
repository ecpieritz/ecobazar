const encodePath = (value: string): string => encodeURIComponent(value);

export const API_ENDPOINTS = {
  products: {
    collection: '/products',
    bySlug: (slug: string): string => `/products/${encodePath(slug)}`,
    reviews: (productId: string): string => `/products/${encodePath(productId)}/reviews`,
  },
  categories: {
    collection: '/categories',
  },
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    session: '/auth/session',
    logout: '/auth/logout',
  },
  customers: {
    profile: '/customers/me',
    addresses: '/customers/me/addresses',
    address: (addressId: string): string => `/customers/me/addresses/${encodePath(addressId)}`,
    password: '/customers/me/password',
  },
  orders: {
    collection: '/orders',
    byId: (orderId: string): string => `/orders/${encodePath(orderId)}`,
  },
} as const;
