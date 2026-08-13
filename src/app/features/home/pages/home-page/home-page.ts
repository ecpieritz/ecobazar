import { ChangeDetectionStrategy, Component } from '@angular/core';

import { HeroBanners } from '../../components/hero-banners/hero-banners';
import { HomeContentSections } from '../../components/home-content-sections/home-content-sections';
import { HomeProductSections } from '../../components/home-product-sections/home-product-sections';
import { PopularCategories } from '../../components/popular-categories/popular-categories';
import { StoreBenefits } from '../../components/store-benefits/store-benefits';

@Component({
  selector: 'app-home-page',
  imports: [
    HeroBanners,
    StoreBenefits,
    PopularCategories,
    HomeProductSections,
    HomeContentSections,
  ],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {}
