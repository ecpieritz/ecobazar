import { EntityId, ImageAsset } from './common.model';

export interface ProductCategory {
  readonly id: EntityId;
  readonly slug: string;
  readonly name: string;
  readonly description: string;
  readonly image: ImageAsset;
  readonly productCount: number;
}
