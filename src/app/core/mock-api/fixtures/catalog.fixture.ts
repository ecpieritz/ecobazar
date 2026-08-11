import { PRODUCT_CATEGORIES_FIXTURE } from './categories.fixture';
import { PRODUCTS_FIXTURE } from './products.fixture';
import { PRODUCT_REVIEWS_FIXTURE } from './reviews.fixture';

export const PRODUCT_CATALOG_FIXTURE = {
  categories: PRODUCT_CATEGORIES_FIXTURE,
  products: PRODUCTS_FIXTURE,
  reviews: PRODUCT_REVIEWS_FIXTURE,
} as const;
