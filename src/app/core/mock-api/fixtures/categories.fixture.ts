import type { ProductCategory } from '@core/domain';

export const CATEGORY_IDS = {
  freshFruit: 'category-fresh-fruit',
  vegetables: 'category-vegetables',
  cooking: 'category-cooking',
  snacks: 'category-snacks',
  beverages: 'category-beverages',
  beautyHealth: 'category-beauty-health',
  breadBakery: 'category-bread-bakery',
} as const;

export const PRODUCT_CATEGORIES_FIXTURE: readonly ProductCategory[] = [
  {
    id: CATEGORY_IDS.freshFruit,
    slug: 'fresh-fruit',
    name: 'Fresh Fruit',
    description: 'Seasonal fruit selected for freshness, flavor, and quality.',
    image: { src: '/images/categories/fresh-fruit.jpg', alt: 'Assorted fresh fruit' },
    productCount: 3,
  },
  {
    id: CATEGORY_IDS.vegetables,
    slug: 'vegetables',
    name: 'Vegetables',
    description: 'Fresh vegetables sourced from trusted growers.',
    image: { src: '/images/categories/vegetables.jpg', alt: 'Assorted fresh vegetables' },
    productCount: 13,
  },
  {
    id: CATEGORY_IDS.cooking,
    slug: 'cooking',
    name: 'Cooking',
    description: 'Everyday ingredients for home cooking.',
    image: { src: '/images/categories/cooking.jpg', alt: 'Cooking ingredients' },
    productCount: 0,
  },
  {
    id: CATEGORY_IDS.snacks,
    slug: 'snacks',
    name: 'Snacks',
    description: 'Simple snacks for any time of day.',
    image: { src: '/images/categories/snacks.jpg', alt: 'Healthy snacks' },
    productCount: 0,
  },
  {
    id: CATEGORY_IDS.beverages,
    slug: 'beverages',
    name: 'Beverages',
    description: 'Refreshing drinks and natural beverages.',
    image: { src: '/images/categories/beverages.jpg', alt: 'Refreshing beverages' },
    productCount: 0,
  },
  {
    id: CATEGORY_IDS.beautyHealth,
    slug: 'beauty-health',
    name: 'Beauty & Health',
    description: 'Wellness products for a balanced routine.',
    image: { src: '/images/categories/beauty-health.jpg', alt: 'Beauty and health products' },
    productCount: 0,
  },
  {
    id: CATEGORY_IDS.breadBakery,
    slug: 'bread-bakery',
    name: 'Bread & Bakery',
    description: 'Freshly baked bread and bakery favorites.',
    image: { src: '/images/categories/bread-bakery.jpg', alt: 'Bread and bakery products' },
    productCount: 0,
  },
];
