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
  readonly dismissed = output<void>();
  readonly navigated = output<void>();

  protected dismiss(): void {
    this.dismissed.emit();
  }

  protected notifyNavigation(): void {
    this.navigated.emit();
  }

  protected preventSearchNavigation(event: SubmitEvent): void {
    event.preventDefault();
  }
}
