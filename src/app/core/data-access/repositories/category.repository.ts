import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, type Observable } from 'rxjs';

import { API_ENDPOINTS, type CategoryListResponse } from '@core/api';
import type { ProductCategory } from '@core/domain';

import { apiUrl } from '../http/api-url';

@Injectable({ providedIn: 'root' })
export class CategoryRepository {
  private readonly http = inject(HttpClient);

  getCategories(): Observable<readonly ProductCategory[]> {
    return this.http
      .get<CategoryListResponse>(apiUrl(API_ENDPOINTS.categories.collection))
      .pipe(map(({ data }) => data));
  }
}
