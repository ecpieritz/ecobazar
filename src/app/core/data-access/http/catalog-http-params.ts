import { HttpParams } from '@angular/common/http';

import type { PaginationQuery, ProductListQuery } from '@core/api';

const setNumber = (params: HttpParams, name: string, value?: number): HttpParams =>
  value === undefined ? params : params.set(name, value);

export const paginationHttpParams = (query: PaginationQuery): HttpParams => {
  let params = new HttpParams();

  params = setNumber(params, 'page', query.page);
  params = setNumber(params, 'pageSize', query.pageSize);

  return params;
};

export const productListHttpParams = (query: ProductListQuery): HttpParams => {
  let params = paginationHttpParams(query);

  if (query.search !== undefined) {
    params = params.set('search', query.search);
  }

  if (query.category !== undefined) {
    params = params.set('category', query.category);
  }

  params = setNumber(params, 'minimumPrice', query.minimumPrice);
  params = setNumber(params, 'maximumPrice', query.maximumPrice);
  params = setNumber(params, 'minimumRating', query.minimumRating);

  if (query.inStock !== undefined) {
    params = params.set('inStock', query.inStock);
  }

  if (query.sale !== undefined) {
    params = params.set('sale', query.sale);
  }

  if (query.featured !== undefined) {
    params = params.set('featured', query.featured);
  }

  if (query.sort !== undefined) {
    params = params.set('sort', query.sort);
  }

  for (const tag of query.tags ?? []) {
    params = params.append('tags', tag);
  }

  return params;
};
