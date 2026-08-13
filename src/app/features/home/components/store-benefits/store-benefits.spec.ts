import { TestBed } from '@angular/core/testing';

import { StoreBenefits } from './store-benefits';

describe('StoreBenefits', () => {
  it('renders four accessible store benefits', async () => {
    await TestBed.configureTestingModule({ imports: [StoreBenefits] }).compileComponents();
    const fixture = TestBed.createComponent(StoreBenefits);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('section')?.getAttribute('aria-label')).toBe('Store benefits');
    expect(element.querySelectorAll('li')).toHaveLength(4);
    expect(element.querySelectorAll('svg[aria-hidden="true"]')).toHaveLength(4);
    expect(element.textContent).toContain('Free shipping');
    expect(element.textContent).toContain('Money-back guarantee');
  });
});
