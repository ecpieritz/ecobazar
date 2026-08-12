import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import type { BreadcrumbItem } from './breadcrumb-item';

@Component({
  selector: 'app-breadcrumb-banner',
  imports: [RouterLink],
  templateUrl: './breadcrumb-banner.html',
  styleUrl: './breadcrumb-banner.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreadcrumbBanner {
  readonly items = input.required<readonly BreadcrumbItem[]>();
}
