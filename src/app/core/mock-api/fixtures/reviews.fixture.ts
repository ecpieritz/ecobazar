import type { EntityId, ProductReview, Rating, ReviewAuthor } from '@core/domain';

import { PRODUCT_IDS } from './products.fixture';

interface ReviewFixtureInput {
  readonly productId: EntityId;
  readonly rating: Rating;
  readonly comment: string;
}

const REVIEW_AUTHORS: readonly ReviewAuthor[] = [
  {
    id: 'customer-kristin-watson',
    name: 'Kristin Watson',
    avatarUrl: '/images/avatars/kristin-watson.webp',
  },
  {
    id: 'customer-jane-cooper',
    name: 'Jane Cooper',
    avatarUrl: '/images/avatars/jane-cooper.webp',
  },
  {
    id: 'customer-jacob-jones',
    name: 'Jacob Jones',
    avatarUrl: '/images/avatars/jacob-jones.webp',
  },
  {
    id: 'customer-ralph-edwards',
    name: 'Ralph Edwards',
    avatarUrl: '/images/avatars/ralph-edwards.webp',
  },
];

const REVIEW_INPUTS: readonly ReviewFixtureInput[] = [
  {
    productId: PRODUCT_IDS.greenApple,
    rating: 4,
    comment: 'Crisp apples with a fresh flavor and excellent texture.',
  },
  {
    productId: PRODUCT_IDS.indianOrange,
    rating: 5,
    comment: 'Very juicy oranges with just the right sweetness.',
  },
  {
    productId: PRODUCT_IDS.mango,
    rating: 4,
    comment: 'The mango arrived ripe, aromatic, and ready to eat.',
  },
  {
    productId: PRODUCT_IDS.bigPotatoes,
    rating: 4,
    comment: 'Clean, firm potatoes that cooked evenly.',
  },
  {
    productId: PRODUCT_IDS.chineseCabbage,
    rating: 5,
    comment: 'Fresh leaves and a pleasant crunch.',
  },
  {
    productId: PRODUCT_IDS.chineseCabbage,
    rating: 4,
    comment: 'Good size and quality, perfect for a quick stir-fry.',
  },
  {
    productId: PRODUCT_IDS.chineseCabbage,
    rating: 5,
    comment: 'Bright green, tender, and carefully packed.',
  },
  {
    productId: PRODUCT_IDS.chineseCabbage,
    rating: 4,
    comment: 'A reliable fresh cabbage with a mild taste.',
  },
  {
    productId: PRODUCT_IDS.sweetCorn,
    rating: 4,
    comment: 'Sweet kernels and a good natural flavor.',
  },
  {
    productId: PRODUCT_IDS.eggplant,
    rating: 4,
    comment: 'Firm eggplant with smooth skin and no bruising.',
  },
  {
    productId: PRODUCT_IDS.cauliflower,
    rating: 4,
    comment: 'Compact florets and very fresh leaves.',
  },
  {
    productId: PRODUCT_IDS.greenCapsicum,
    rating: 5,
    comment: 'Crunchy, fragrant, and excellent for salads.',
  },
  {
    productId: PRODUCT_IDS.greenChili,
    rating: 4,
    comment: 'Fresh chilies with consistent heat.',
  },
  {
    productId: PRODUCT_IDS.cucumber,
    rating: 4,
    comment: 'Crisp and refreshing with very few seeds.',
  },
  {
    productId: PRODUCT_IDS.greenLettuce,
    rating: 4,
    comment: 'Clean leaves with a nice crisp texture.',
  },
  {
    productId: PRODUCT_IDS.okra,
    rating: 4,
    comment: 'Young, tender okra in a consistent size.',
  },
  {
    productId: PRODUCT_IDS.redCapsicum,
    rating: 5,
    comment: 'Sweet, colorful, and exceptionally fresh.',
  },
  {
    productId: PRODUCT_IDS.redChili,
    rating: 4,
    comment: 'Bold flavor and plenty of heat.',
  },
  {
    productId: PRODUCT_IDS.redTomato,
    rating: 5,
    comment: 'Juicy tomatoes with rich color and flavor.',
  },
];

export const PRODUCT_REVIEWS_FIXTURE: readonly ProductReview[] = REVIEW_INPUTS.map(
  (review, index) => ({
    id: `review-${String(index + 1).padStart(3, '0')}`,
    productId: review.productId,
    author: REVIEW_AUTHORS[index % REVIEW_AUTHORS.length],
    rating: review.rating,
    comment: review.comment,
    createdAt: `2026-07-${String((index % 28) + 1).padStart(2, '0')}T12:00:00.000Z`,
  }),
);
