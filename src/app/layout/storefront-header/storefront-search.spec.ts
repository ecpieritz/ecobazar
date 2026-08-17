import { TestBed } from '@angular/core/testing';

import { StorefrontSearch } from './storefront-search';

describe('StorefrontSearch', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [StorefrontSearch] }).compileComponents();
  });

  it('trims and emits the submitted product query', () => {
    const fixture = TestBed.createComponent(StorefrontSearch);
    fixture.componentRef.setInput('controlId', 'product-search');
    const submitted = vi.fn();
    fixture.componentInstance.searchSubmitted.subscribe(submitted);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const input = element.querySelector('input') as HTMLInputElement;

    input.value = '  green apple  ';
    input.dispatchEvent(new Event('input'));
    element
      .querySelector('form')
      ?.dispatchEvent(new SubmitEvent('submit', { bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(submitted).toHaveBeenCalledWith('green apple');
    expect(input.value).toBe('green apple');
  });

  it('clears an active query and emits an empty search', () => {
    const fixture = TestBed.createComponent(StorefrontSearch);
    fixture.componentRef.setInput('controlId', 'product-search');
    fixture.componentRef.setInput('initialQuery', 'mango');
    const submitted = vi.fn();
    fixture.componentInstance.searchSubmitted.subscribe(submitted);
    fixture.detectChanges();

    (
      fixture.nativeElement.querySelector('[aria-label="Clear search"]') as HTMLButtonElement
    ).click();
    fixture.detectChanges();

    expect(submitted).toHaveBeenCalledWith('');
    expect((fixture.nativeElement.querySelector('input') as HTMLInputElement).value).toBe('');
  });
});
