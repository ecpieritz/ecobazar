import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import { API_ENDPOINTS, type ReviewListQuery, type ReviewListResponse } from '@core/api';

import { apiUrl } from '../http/api-url';
import { paginationHttpParams } from '../http/catalog-http-params';

@Injectable({ providedIn: 'root' })
export class ReviewRepository {
  private readonly http = inject(HttpClient);

  getProductReviews({ productId, ...pagination }: ReviewListQuery): Observable<ReviewListResponse> {
    return this.http.get<ReviewListResponse>(apiUrl(API_ENDPOINTS.products.reviews(productId)), {
      params: paginationHttpParams(pagination),
    });
  }
}
