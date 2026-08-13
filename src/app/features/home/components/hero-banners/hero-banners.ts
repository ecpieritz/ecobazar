import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-hero-banners',
  imports: [RouterLink],
  templateUrl: './hero-banners.html',
  styleUrl: './hero-banners.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroBanners {}
