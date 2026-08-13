import type {
  EntityId,
  Money,
  Product,
  ProductAttribute,
  ProductBadge,
  ProductImage,
  ProductUnit,
  Rating,
  StockStatus,
} from '@core/domain';

import { CATEGORY_IDS } from './categories.fixture';

export const PRODUCT_IDS = {
  greenApple: 'product-green-apple',
  indianOrange: 'product-indian-orange',
  mango: 'product-mango',
  bigPotatoes: 'product-big-potatoes',
  chineseCabbage: 'product-chinese-cabbage',
  sweetCorn: 'product-sweet-corn',
  eggplant: 'product-eggplant',
  cauliflower: 'product-cauliflower',
  greenCapsicum: 'product-green-capsicum',
  greenChili: 'product-green-chili',
  cucumber: 'product-cucumber',
  greenLettuce: 'product-green-lettuce',
  okra: 'product-okra',
  redCapsicum: 'product-red-capsicum',
  redChili: 'product-red-chili',
  redTomato: 'product-red-tomato',
} as const;

interface ProductFixtureInput {
  readonly id: EntityId;
  readonly slug: string;
  readonly sku: string;
  readonly name: string;
  readonly shortDescription: string;
  readonly categoryId: EntityId;
  readonly price: number;
  readonly compareAtPrice?: number;
  readonly unit: ProductUnit;
  readonly quantity: number;
  readonly rating: Rating | 4.5;
  readonly reviewCount?: number;
  readonly imageCount?: number;
  readonly badge?: ProductBadge;
  readonly featured?: boolean;
  readonly tags: readonly string[];
  readonly attributes?: readonly ProductAttribute[];
}

const money = (amount: number): Money => ({ amount, currency: 'USD' });

const stockStatus = (quantity: number): StockStatus => {
  if (quantity === 0) {
    return 'out-of-stock';
  }

  return quantity <= 10 ? 'low-stock' : 'in-stock';
};

const productImages = (slug: string, name: string, count = 1): readonly ProductImage[] =>
  Array.from({ length: count }, (_, index) => {
    const position = index + 1;

    return {
      id: `image-${slug}-${position}`,
      src: `/images/products/${slug}-${position}.jpg`,
      alt: count === 1 ? name : `${name} view ${position}`,
      isPrimary: index === 0,
    };
  });

const createProduct = (input: ProductFixtureInput): Product => ({
  id: input.id,
  slug: input.slug,
  sku: input.sku,
  name: input.name,
  shortDescription: input.shortDescription,
  description: `${input.shortDescription} Carefully selected and packed to preserve its natural freshness and flavor.`,
  categoryId: input.categoryId,
  brand: { name: 'Ecobazar Farms' },
  price: money(input.price),
  ...(input.compareAtPrice === undefined ? {} : { compareAtPrice: money(input.compareAtPrice) }),
  unit: input.unit,
  inventory: {
    quantity: input.quantity,
    status: stockStatus(input.quantity),
  },
  images: productImages(input.slug, input.name, input.imageCount),
  attributes: [
    { name: 'Type', value: 'Organic' },
    { name: 'Unit', value: input.unit },
    ...(input.attributes ?? []),
  ],
  tags: input.tags,
  rating: {
    average: input.rating,
    count: input.reviewCount ?? 1,
  },
  ...(input.badge === undefined ? {} : { badge: input.badge }),
  featured: input.featured ?? false,
  createdAt: '2026-07-01T09:00:00.000Z',
  updatedAt: '2026-08-01T09:00:00.000Z',
});

export const PRODUCTS_FIXTURE: readonly Product[] = [
  createProduct({
    id: PRODUCT_IDS.greenApple,
    slug: 'green-apple',
    sku: 'FRT-APL-001',
    name: 'Green Apple',
    shortDescription: 'Crisp organic apples with a bright, tangy flavor.',
    categoryId: CATEGORY_IDS.freshFruit,
    price: 14.99,
    compareAtPrice: 20.99,
    unit: 'kg',
    quantity: 48,
    rating: 4,
    badge: 'sale',
    featured: true,
    tags: ['fruit', 'healthy', 'organic'],
    attributes: [{ name: 'Color', value: 'Green' }],
  }),
  createProduct({
    id: PRODUCT_IDS.indianOrange,
    slug: 'fresh-indian-orange',
    sku: 'FRT-ORG-002',
    name: 'Fresh Indian Orange',
    shortDescription: 'Juicy oranges with balanced sweetness and acidity.',
    categoryId: CATEGORY_IDS.freshFruit,
    price: 12,
    unit: 'kg',
    quantity: 36,
    rating: 5,
    featured: true,
    tags: ['fruit', 'vitamin-c', 'fresh'],
    attributes: [{ name: 'Color', value: 'Orange' }],
  }),
  createProduct({
    id: PRODUCT_IDS.mango,
    slug: 'fresh-mango',
    sku: 'FRT-MNG-003',
    name: 'Fresh Mango',
    shortDescription: 'Aromatic ripe mango with naturally sweet flesh.',
    categoryId: CATEGORY_IDS.freshFruit,
    price: 9,
    unit: 'each',
    quantity: 6,
    rating: 4,
    badge: 'new',
    tags: ['fruit', 'tropical', 'fresh'],
    attributes: [{ name: 'Color', value: 'Yellow and red' }],
  }),
  createProduct({
    id: PRODUCT_IDS.bigPotatoes,
    slug: 'big-potatoes',
    sku: 'VEG-POT-004',
    name: 'Big Potatoes',
    shortDescription: 'Versatile potatoes with a creamy texture when cooked.',
    categoryId: CATEGORY_IDS.vegetables,
    price: 14.99,
    unit: 'kg',
    quantity: 80,
    rating: 4,
    tags: ['vegetables', 'cooking', 'organic'],
    attributes: [{ name: 'Color', value: 'Golden' }],
  }),
  createProduct({
    id: PRODUCT_IDS.chineseCabbage,
    slug: 'chinese-cabbage',
    sku: 'VEG-CAB-005',
    name: 'Chinese Cabbage',
    shortDescription: 'Tender leafy cabbage with a mild and refreshing taste.',
    categoryId: CATEGORY_IDS.vegetables,
    price: 17.28,
    compareAtPrice: 48,
    unit: 'each',
    quantity: 45,
    rating: 4.5,
    reviewCount: 4,
    imageCount: 4,
    badge: 'best-sale',
    featured: true,
    tags: ['vegetables', 'healthy', 'cabbage'],
    attributes: [{ name: 'Color', value: 'Green' }],
  }),
  createProduct({
    id: PRODUCT_IDS.sweetCorn,
    slug: 'sweet-corn',
    sku: 'VEG-CRN-006',
    name: 'Sweet Corn',
    shortDescription: 'Golden sweet corn with plump, tender kernels.',
    categoryId: CATEGORY_IDS.vegetables,
    price: 14.99,
    compareAtPrice: 20.99,
    unit: 'each',
    quantity: 0,
    rating: 4,
    tags: ['vegetables', 'sweet', 'seasonal'],
    attributes: [{ name: 'Color', value: 'Yellow' }],
  }),
  createProduct({
    id: PRODUCT_IDS.eggplant,
    slug: 'eggplant',
    sku: 'VEG-EGG-007',
    name: 'Eggplant',
    shortDescription: 'Glossy eggplant with firm flesh and a delicate flavor.',
    categoryId: CATEGORY_IDS.vegetables,
    price: 14.99,
    unit: 'kg',
    quantity: 32,
    rating: 4,
    tags: ['vegetables', 'low-fat', 'cooking'],
    attributes: [{ name: 'Color', value: 'Purple' }],
  }),
  createProduct({
    id: PRODUCT_IDS.cauliflower,
    slug: 'fresh-cauliflower',
    sku: 'VEG-CLF-008',
    name: 'Fresh Cauliflower',
    shortDescription: 'Compact cauliflower with crisp florets and mild flavor.',
    categoryId: CATEGORY_IDS.vegetables,
    price: 14.99,
    unit: 'each',
    quantity: 24,
    rating: 4,
    featured: true,
    tags: ['vegetables', 'healthy', 'low-fat'],
    attributes: [{ name: 'Color', value: 'White' }],
  }),
  createProduct({
    id: PRODUCT_IDS.greenCapsicum,
    slug: 'green-capsicum',
    sku: 'VEG-CAP-009',
    name: 'Green Capsicum',
    shortDescription: 'Crunchy green capsicum with a clean garden flavor.',
    categoryId: CATEGORY_IDS.vegetables,
    price: 14.99,
    unit: 'kg',
    quantity: 40,
    rating: 5,
    featured: true,
    tags: ['vegetables', 'healthy', 'capsicum'],
    attributes: [{ name: 'Color', value: 'Green' }],
  }),
  createProduct({
    id: PRODUCT_IDS.greenChili,
    slug: 'green-chili',
    sku: 'VEG-CHL-010',
    name: 'Green Chili',
    shortDescription: 'Fresh green chilies with a vibrant spicy kick.',
    categoryId: CATEGORY_IDS.vegetables,
    price: 14.99,
    unit: 'kg',
    quantity: 50,
    rating: 4,
    tags: ['vegetables', 'spicy', 'cooking'],
    attributes: [{ name: 'Color', value: 'Green' }],
  }),
  createProduct({
    id: PRODUCT_IDS.cucumber,
    slug: 'green-cucumber',
    sku: 'VEG-CUC-011',
    name: 'Green Cucumber',
    shortDescription: 'Cool, hydrating cucumber with crisp flesh.',
    categoryId: CATEGORY_IDS.vegetables,
    price: 14.99,
    compareAtPrice: 20.99,
    unit: 'kg',
    quantity: 18,
    rating: 4,
    badge: 'sale',
    tags: ['vegetables', 'healthy', 'low-fat'],
    attributes: [{ name: 'Color', value: 'Green' }],
  }),
  createProduct({
    id: PRODUCT_IDS.greenLettuce,
    slug: 'green-lettuce',
    sku: 'VEG-LET-012',
    name: 'Green Lettuce',
    shortDescription: 'Fresh leafy lettuce with a light, crisp bite.',
    categoryId: CATEGORY_IDS.vegetables,
    price: 14.99,
    unit: 'each',
    quantity: 30,
    rating: 4,
    tags: ['vegetables', 'healthy', 'salad'],
    attributes: [{ name: 'Color', value: 'Green' }],
  }),
  createProduct({
    id: PRODUCT_IDS.okra,
    slug: 'okra',
    sku: 'VEG-OKR-013',
    name: 'Okra',
    shortDescription: 'Tender young okra selected for consistent texture.',
    categoryId: CATEGORY_IDS.vegetables,
    price: 14.99,
    unit: 'kg',
    quantity: 22,
    rating: 4,
    tags: ['vegetables', 'cooking', 'organic'],
    attributes: [{ name: 'Color', value: 'Green' }],
  }),
  createProduct({
    id: PRODUCT_IDS.redCapsicum,
    slug: 'red-capsicum',
    sku: 'VEG-CAP-014',
    name: 'Red Capsicum',
    shortDescription: 'Sweet red capsicum with crisp, juicy walls.',
    categoryId: CATEGORY_IDS.vegetables,
    price: 32,
    compareAtPrice: 40,
    unit: 'kg',
    quantity: 20,
    rating: 5,
    badge: 'sale',
    tags: ['vegetables', 'healthy', 'capsicum'],
    attributes: [{ name: 'Color', value: 'Red' }],
  }),
  createProduct({
    id: PRODUCT_IDS.redChili,
    slug: 'red-chili',
    sku: 'VEG-CHL-015',
    name: 'Red Chili',
    shortDescription: 'Ripe red chilies with bold heat and rich aroma.',
    categoryId: CATEGORY_IDS.vegetables,
    price: 14.99,
    unit: 'kg',
    quantity: 35,
    rating: 4,
    tags: ['vegetables', 'spicy', 'cooking'],
    attributes: [{ name: 'Color', value: 'Red' }],
  }),
  createProduct({
    id: PRODUCT_IDS.redTomato,
    slug: 'red-tomato',
    sku: 'VEG-TOM-016',
    name: 'Red Tomato',
    shortDescription: 'Vine-ripened tomatoes with juicy, balanced flavor.',
    categoryId: CATEGORY_IDS.vegetables,
    price: 14.99,
    unit: 'kg',
    quantity: 44,
    rating: 5,
    featured: true,
    tags: ['vegetables', 'fresh', 'cooking'],
    attributes: [{ name: 'Color', value: 'Red' }],
  }),
];
