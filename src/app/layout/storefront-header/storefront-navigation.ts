import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-storefront-navigation',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './storefront-navigation.html',
  styleUrl: './storefront-navigation.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StorefrontNavigation {
  readonly isOpen = input.required<boolean>();
  readonly navigated = output<void>();

  protected notifyNavigation(): void {
    this.navigated.emit();
  }

  protected preventSearchNavigation(event: SubmitEvent): void {
    event.preventDefault();
  }
}
