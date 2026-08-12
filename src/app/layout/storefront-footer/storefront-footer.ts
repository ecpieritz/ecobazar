import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface FooterLink {
  readonly label: string;
  readonly route: string;
  readonly queryParams?: Readonly<Record<string, string>>;
}

interface FooterLinkGroup {
  readonly title: string;
  readonly links: readonly FooterLink[];
}

@Component({
  selector: 'app-storefront-footer',
  imports: [RouterLink],
  templateUrl: './storefront-footer.html',
  styleUrl: './storefront-footer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StorefrontFooter {
  protected readonly currentYear = new Date().getFullYear();
  protected readonly linkGroups: readonly FooterLinkGroup[] = [
    {
      title: 'My Account',
      links: [
        { label: 'My Account', route: '/account' },
        { label: 'Order History', route: '/account/orders' },
        { label: 'Shopping Cart', route: '/cart' },
        { label: 'Wishlist', route: '/wishlist' },
      ],
    },
    {
      title: 'Help',
      links: [
        { label: 'Contact', route: '/contact' },
        { label: 'FAQs', route: '/faq' },
        { label: 'Checkout', route: '/checkout' },
        { label: 'Account Settings', route: '/account/settings' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', route: '/about' },
        { label: 'Shop', route: '/shop' },
        { label: 'Sign In', route: '/login' },
        { label: 'Create Account', route: '/register' },
      ],
    },
    {
      title: 'Categories',
      links: [
        { label: 'Fresh Fruit', route: '/shop', queryParams: { category: 'fresh-fruit' } },
        { label: 'Vegetables', route: '/shop', queryParams: { category: 'vegetables' } },
        { label: 'Beverages', route: '/shop', queryParams: { category: 'beverages' } },
        { label: 'Bread & Bakery', route: '/shop', queryParams: { category: 'bread-bakery' } },
      ],
    },
  ];
}
