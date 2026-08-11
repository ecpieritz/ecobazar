import { HttpRequest } from '@angular/common/http';

import type {
  CategoryListResponse,
  ProductListResponse,
  ProductResponse,
  ProductSortOption,
  ReviewListResponse,
} from '@core/api';
import type { Product, Rating } from '@core/domain';

import { PRODUCT_CATEGORIES_FIXTURE, PRODUCT_REVIEWS_FIXTURE, PRODUCTS_FIXTURE } from '../fixtures';
import { mockErrorResponse, mockJsonResponse, type MockApiResult } from '../http/mock-api-response';

class InvalidQueryError extends Error {}

const SORT_OPTIONS: readonly ProductSortOption[] = [
  'featured',
  'newest',
  'price-ascending',
  'price-descending',
  'rating',
];

const decodePathSegment = (segment: string): string => {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
};

const parsePositiveInteger = (
  searchParams: URLSearchParams,
  name: string,
  fallback: number,
): number => {
  const value = searchParams.get(name);

  if (value === null) {
    return fallback;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new InvalidQueryError(`${name} must be a positive integer.`);
  }

  return parsed;
};

const parseOptionalNumber = (searchParams: URLSearchParams, name: string): number | undefined => {
  const value = searchParams.get(name);

  if (value === null) {
    return undefined;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new InvalidQueryError(`${name} must be a non-negative number.`);
  }

  return parsed;
};

const parseMinimumRating = (searchParams: URLSearchParams): Rating | undefined => {
  const value = searchParams.get('minimumRating');

  if (value === null) {
    return undefined;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 5) {
    throw new InvalidQueryError('minimumRating must be an integer between 1 and 5.');
  }

  return parsed as Rating;
};

const parseInStock = (searchParams: URLSearchParams): boolean | undefined => {
  const value = searchParams.get('inStock');

  if (value === null) {
    return undefined;
  }

  if (value !== 'true' && value !== 'false') {
    throw new InvalidQueryError('inStock must be true or false.');
  }

  return value === 'true';
};

const parseSort = (searchParams: URLSearchParams): ProductSortOption => {
  const value = searchParams.get('sort') ?? 'featured';

  if (!SORT_OPTIONS.includes(value as ProductSortOption)) {
    throw new InvalidQueryError(`Unsupported sort option: ${value}.`);
  }

  return value as ProductSortOption;
};

const sortProducts = (products: readonly Product[], sort: ProductSortOption): Product[] => {
  const sorted = [...products];

  switch (sort) {
    case 'newest':
      return sorted.sort((first, second) => second.createdAt.localeCompare(first.createdAt));
    case 'price-ascending':
      return sorted.sort((first, second) => first.price.amount - second.price.amount);
    case 'price-descending':
      return sorted.sort((first, second) => second.price.amount - first.price.amount);
    case 'rating':
      return sorted.sort((first, second) => second.rating.average - first.rating.average);
    case 'featured':
      return sorted.sort(
        (first, second) =>
          Number(second.featured) - Number(first.featured) ||
          second.rating.average - first.rating.average ||
          first.name.localeCompare(second.name),
      );
  }
};

const listProducts = (request: HttpRequest<unknown>, url: URL): MockApiResult => {
  try {
    const page = parsePositiveInteger(url.searchParams, 'page', 1);
    const pageSize = Math.min(parsePositiveInteger(url.searchParams, 'pageSize', 12), 100);
    const minimumPrice = parseOptionalNumber(url.searchParams, 'minimumPrice');
    const maximumPrice = parseOptionalNumber(url.searchParams, 'maximumPrice');
    const minimumRating = parseMinimumRating(url.searchParams);
    const inStock = parseInStock(url.searchParams);
    const sort = parseSort(url.searchParams);
    const search = url.searchParams.get('search')?.trim().toLocaleLowerCase() ?? '';
    const categoryValue = url.searchParams.get('category');
    const category = PRODUCT_CATEGORIES_FIXTURE.find(
      ({ id, slug }) => id === categoryValue || slug === categoryValue,
    );
    const tags = url.searchParams
      .getAll('tags')
      .flatMap((value) => value.split(','))
      .map((value) => value.trim().toLocaleLowerCase())
      .filter(Boolean);

    if (minimumPrice !== undefined && maximumPrice !== undefined && minimumPrice > maximumPrice) {
      throw new InvalidQueryError('minimumPrice cannot be greater than maximumPrice.');
    }

    const filtered = PRODUCTS_FIXTURE.filter((product) => {
      const searchableText = [product.name, product.shortDescription, ...product.tags]
        .join(' ')
        .toLocaleLowerCase();

      return (
        (!search || searchableText.includes(search)) &&
        (!categoryValue || product.categoryId === category?.id) &&
        (minimumPrice === undefined || product.price.amount >= minimumPrice) &&
        (maximumPrice === undefined || product.price.amount <= maximumPrice) &&
        (minimumRating === undefined || product.rating.average >= minimumRating) &&
        (inStock === undefined || product.inventory.quantity > 0 === inStock) &&
        (tags.length === 0 || tags.every((tag) => product.tags.includes(tag)))
      );
    });
    const sorted = sortProducts(filtered, sort);
    const totalItems = sorted.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (page - 1) * pageSize;
    const data = sorted.slice(startIndex, startIndex + pageSize);
    const body: ProductListResponse = {
      data,
      pagination: { page, pageSize, totalItems, totalPages },
    };

    return mockJsonResponse(request, body);
  } catch (error) {
    if (error instanceof InvalidQueryError) {
      return mockErrorResponse(request, 400, 'INVALID_QUERY', error.message);
    }

    throw error;
  }
};

const getProduct = (request: HttpRequest<unknown>, slug: string): MockApiResult => {
  const product = PRODUCTS_FIXTURE.find((item) => item.slug === slug);

  if (!product) {
    return mockErrorResponse(request, 404, 'PRODUCT_NOT_FOUND', `Product '${slug}' was not found.`);
  }

  const body: ProductResponse = { data: product };
  return mockJsonResponse(request, body);
};

const listReviews = (request: HttpRequest<unknown>, url: URL, productId: string): MockApiResult => {
  const productExists = PRODUCTS_FIXTURE.some(({ id }) => id === productId);

  if (!productExists) {
    return mockErrorResponse(
      request,
      404,
      'PRODUCT_NOT_FOUND',
      `Product '${productId}' was not found.`,
    );
  }

  try {
    const page = parsePositiveInteger(url.searchParams, 'page', 1);
    const pageSize = Math.min(parsePositiveInteger(url.searchParams, 'pageSize', 10), 100);
    const reviews = PRODUCT_REVIEWS_FIXTURE.filter((review) => review.productId === productId);
    const totalItems = reviews.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (page - 1) * pageSize;
    const body: ReviewListResponse = {
      data: reviews.slice(startIndex, startIndex + pageSize),
      pagination: { page, pageSize, totalItems, totalPages },
    };

    return mockJsonResponse(request, body);
  } catch (error) {
    if (error instanceof InvalidQueryError) {
      return mockErrorResponse(request, 400, 'INVALID_QUERY', error.message);
    }

    throw error;
  }
};

const methodNotAllowed = (request: HttpRequest<unknown>): MockApiResult =>
  mockErrorResponse(
    request,
    405,
    'METHOD_NOT_ALLOWED',
    `${request.method} is not supported for this endpoint.`,
  );

export const handleCatalogRequest = (
  request: HttpRequest<unknown>,
  url: URL,
  apiPath: string,
): MockApiResult | null => {
  const segments = apiPath.split('/').filter(Boolean).map(decodePathSegment);

  if (segments[0] === 'categories' && segments.length === 1) {
    if (request.method !== 'GET') {
      return methodNotAllowed(request);
    }

    const body: CategoryListResponse = { data: PRODUCT_CATEGORIES_FIXTURE };
    return mockJsonResponse(request, body);
  }

  if (segments[0] !== 'products') {
    return null;
  }

  if (request.method !== 'GET') {
    return methodNotAllowed(request);
  }

  if (segments.length === 1) {
    return listProducts(request, url);
  }

  if (segments.length === 2) {
    return getProduct(request, segments[1]);
  }

  if (segments.length === 3 && segments[2] === 'reviews') {
    return listReviews(request, url, segments[1]);
  }

  return null;
};
