import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { PRODUCTS_FIXTURE } from '@core/mock-api/fixtures';
import { LOCAL_STORAGE } from '@core/persistence';
import { ShoppingCartStore, WishlistStore } from '@core/state';

import { WishlistPage } from './wishlist-page';

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>();
  get length(): number {
    return this.values.size;
  }
  clear(): void {
    this.values.clear();
  }
  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }
  key(index: number): string | null {
    return [...this.values.keys()][index] ?? null;
  }
  removeItem(key: string): void {
    this.values.delete(key);
  }
  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

describe('WishlistPage', () => {
  const apple = PRODUCTS_FIXTURE.find(({ slug }) => slug === 'green-apple')!;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WishlistPage],
      providers: [
        provideRouter([]),
        { provide: LOCAL_STORAGE, useFactory: () => new MemoryStorage() },
      ],
    }).compileComponents();
  });

  it('renders an empty wishlist state', () => {
    const fixture = TestBed.createComponent(WishlistPage);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Your wishlist is empty');
  });

  it('moves a saved product to the shopping cart', () => {
    const wishlist = TestBed.inject(WishlistStore);
    const shoppingCart = TestBed.inject(ShoppingCartStore);
    wishlist.addProduct(apple);
    const fixture = TestBed.createComponent(WishlistPage);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('.wishlist-line__product')?.textContent).toContain(apple.name);
    (element.querySelector('.add-button') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(wishlist.isEmpty()).toBe(true);
    expect(shoppingCart.itemCount()).toBe(1);
    expect(element.textContent).toContain(`${apple.name} was moved to your cart.`);
  });

  it('removes a product without adding it to the cart', () => {
    const wishlist = TestBed.inject(WishlistStore);
    wishlist.addProduct(apple);
    const fixture = TestBed.createComponent(WishlistPage);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    (
      element.querySelector(
        `[aria-label="Remove ${apple.name} from wishlist"]`,
      ) as HTMLButtonElement
    ).click();
    fixture.detectChanges();

    expect(wishlist.isEmpty()).toBe(true);
    expect(TestBed.inject(ShoppingCartStore).isEmpty()).toBe(true);
  });
});
