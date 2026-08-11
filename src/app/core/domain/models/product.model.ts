import { EntityId, ImageAsset, IsoDateString, Money, RatingSummary } from './common.model';

export type ProductUnit = 'each' | 'kg' | 'lb' | 'bunch';
export type StockStatus = 'in-stock' | 'low-stock' | 'out-of-stock';
export type ProductBadge = 'sale' | 'new' | 'best-sale';

export interface ProductImage extends ImageAsset {
  readonly id: EntityId;
  readonly isPrimary: boolean;
}

export interface ProductAttribute {
  readonly name: string;
  readonly value: string;
}

export interface ProductBrand {
  readonly name: string;
  readonly logo?: ImageAsset;
}

export interface ProductInventory {
  readonly quantity: number;
  readonly status: StockStatus;
}

export interface Product {
  readonly id: EntityId;
  readonly slug: string;
  readonly sku: string;
  readonly name: string;
  readonly shortDescription: string;
  readonly description: string;
  readonly categoryId: EntityId;
  readonly brand: ProductBrand;
  readonly price: Money;
  readonly compareAtPrice?: Money;
  readonly unit: ProductUnit;
  readonly inventory: ProductInventory;
  readonly images: readonly ProductImage[];
  readonly attributes: readonly ProductAttribute[];
  readonly tags: readonly string[];
  readonly rating: RatingSummary;
  readonly badge?: ProductBadge;
  readonly featured: boolean;
  readonly createdAt: IsoDateString;
  readonly updatedAt: IsoDateString;
}
