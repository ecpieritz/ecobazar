import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, type Observable } from 'rxjs';

import {
  API_ENDPOINTS,
  type ProductListQuery,
  type ProductListResponse,
  type ProductResponse,
} from '@core/api';
import type { Product } from '@core/domain';

import { apiUrl } from '../http/api-url';
import { productListHttpParams } from '../http/catalog-http-params';

@Injectable({ providedIn: 'root' })
export class ProductRepository {
  private readonly http = inject(HttpClient);

  getProducts(query: ProductListQuery = {}): Observable<ProductListResponse> {
    return this.http.get<ProductListResponse>(apiUrl(API_ENDPOINTS.products.collection), {
      params: productListHttpParams(query),
    });
  }

  getProductBySlug(slug: string): Observable<Product> {
    return this.http
      .get<ProductResponse>(apiUrl(API_ENDPOINTS.products.bySlug(slug)))
      .pipe(map(({ data }) => data));
  }
}
