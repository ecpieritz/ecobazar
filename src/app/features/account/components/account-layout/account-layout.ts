import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthStore } from '@core/auth';

@Component({
  selector: 'app-account-layout',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './account-layout.html',
  styleUrl: './account-layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountLayout {
  protected readonly auth = inject(AuthStore);
  private readonly router = inject(Router);

  protected logout(): void {
    this.auth.logout();
    void this.router.navigateByUrl('/');
  }
}
