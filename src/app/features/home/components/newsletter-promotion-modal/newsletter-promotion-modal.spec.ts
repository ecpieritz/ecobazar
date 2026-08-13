import { TestBed } from '@angular/core/testing';

import { LOCAL_STORAGE } from '@core/persistence';

import { NewsletterPromotionModal } from './newsletter-promotion-modal';

const installDialogPolyfill = (): void => {
  Object.defineProperties(HTMLDialogElement.prototype, {
    showModal: {
      configurable: true,
      value(this: HTMLDialogElement): void {
        this.open = true;
      },
    },
    close: {
      configurable: true,
      value(this: HTMLDialogElement, returnValue = ''): void {
        this.returnValue = returnValue;
        this.open = false;
        this.dispatchEvent(new Event('close'));
      },
    },
  });
};

const createStorage = (dismissed = false): Storage => {
  const values = new Map<string, string>();

  if (dismissed) {
    values.set('ecobazar:newsletter-promotion-dismissed', 'true');
  }

  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => [...values.keys()][index] ?? null,
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => values.set(key, value),
  };
};

describe('NewsletterPromotionModal', () => {
  beforeAll(installDialogPolyfill);

  it('opens for visitors who have not dismissed the promotion', async () => {
    await TestBed.configureTestingModule({
      imports: [NewsletterPromotionModal],
      providers: [{ provide: LOCAL_STORAGE, useValue: createStorage() }],
    }).compileComponents();

    const fixture = TestBed.createComponent(NewsletterPromotionModal);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('dialog')?.hasAttribute('open')).toBe(true);
    expect(element.querySelector('h2')?.textContent).toContain('Subscribe to Our Newsletter');
    expect(element.querySelector('img')?.getAttribute('src')).toBe(
      '/images/home/newsletter-promotion.jpg',
    );
  });

  it('persists the opt-out preference when the modal is closed', async () => {
    const storage = createStorage();
    const setItem = vi.spyOn(storage, 'setItem');
    await TestBed.configureTestingModule({
      imports: [NewsletterPromotionModal],
      providers: [{ provide: LOCAL_STORAGE, useValue: storage }],
    }).compileComponents();

    const fixture = TestBed.createComponent(NewsletterPromotionModal);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const checkbox = element.querySelector<HTMLInputElement>('input[type="checkbox"]');

    if (!checkbox) {
      throw new Error('Preference checkbox was not rendered');
    }

    checkbox.checked = true;
    checkbox.dispatchEvent(new Event('change'));
    element.querySelector<HTMLButtonElement>('.modal__header button')?.click();
    fixture.detectChanges();

    expect(setItem).toHaveBeenCalledWith('ecobazar:newsletter-promotion-dismissed', 'true');
  });

  it('stays closed after the promotion has been dismissed', async () => {
    await TestBed.configureTestingModule({
      imports: [NewsletterPromotionModal],
      providers: [{ provide: LOCAL_STORAGE, useValue: createStorage(true) }],
    }).compileComponents();

    const fixture = TestBed.createComponent(NewsletterPromotionModal);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('dialog')?.hasAttribute('open')).toBe(false);
  });
});
