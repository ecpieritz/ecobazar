import { TestBed } from '@angular/core/testing';

import type { ProductImage } from '@core/domain';

import { ProductGallery } from './product-gallery';

describe('ProductGallery', () => {
  const images: readonly ProductImage[] = [
    { id: 'front', src: '/front.jpg', alt: 'Cabbage front view', isPrimary: true },
    { id: 'side', src: '/side.jpg', alt: 'Cabbage side view', isPrimary: false },
  ];

  it('selects product images using accessible thumbnail controls', () => {
    const fixture = TestBed.createComponent(ProductGallery);
    fixture.componentRef.setInput('images', images);
    fixture.componentRef.setInput('productName', 'Chinese Cabbage');
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const secondThumbnail = element.querySelector(
      'button[aria-label="Show Cabbage side view"]',
    ) as HTMLButtonElement;

    secondThumbnail.click();
    fixture.detectChanges();

    expect(element.querySelector('.gallery__stage > img')?.getAttribute('alt')).toBe(
      'Cabbage side view',
    );
    expect(secondThumbnail.getAttribute('aria-current')).toBe('true');
  });

  it('cycles through images with the gallery arrows', () => {
    const fixture = TestBed.createComponent(ProductGallery);
    fixture.componentRef.setInput('images', images);
    fixture.componentRef.setInput('productName', 'Chinese Cabbage');
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    (element.querySelector('.gallery__arrow--next') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(element.querySelector('.gallery__stage > img')?.getAttribute('alt')).toBe(
      'Cabbage side view',
    );

    (element.querySelector('.gallery__arrow--previous') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(element.querySelector('.gallery__stage > img')?.getAttribute('alt')).toBe(
      'Cabbage front view',
    );
  });
});
