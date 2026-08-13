import { ChangeDetectionStrategy, Component } from '@angular/core';

import { HeroBanners } from '../../components/hero-banners/hero-banners';
import { PopularCategories } from '../../components/popular-categories/popular-categories';
import { StoreBenefits } from '../../components/store-benefits/store-benefits';

@Component({
  selector: 'app-home-page',
  imports: [HeroBanners, StoreBenefits, PopularCategories],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {}
