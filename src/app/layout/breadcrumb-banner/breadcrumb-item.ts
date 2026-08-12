import type { Data } from '@angular/router';

export interface BreadcrumbItem {
  readonly label: string;
  readonly route?: string;
}

export const BREADCRUMBS_ROUTE_DATA = 'breadcrumbs';

export const breadcrumbRouteData = (...breadcrumbs: readonly BreadcrumbItem[]): Data => ({
  [BREADCRUMBS_ROUTE_DATA]: breadcrumbs,
});
