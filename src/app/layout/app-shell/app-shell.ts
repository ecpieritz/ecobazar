import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { StorefrontHeader } from '../storefront-header/storefront-header';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, StorefrontHeader],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppShell {}
