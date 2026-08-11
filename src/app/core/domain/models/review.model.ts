import { EntityId, IsoDateString, Rating } from './common.model';

export interface ReviewAuthor {
  readonly id: EntityId;
  readonly name: string;
  readonly avatarUrl?: string;
}

export interface ProductReview {
  readonly id: EntityId;
  readonly productId: EntityId;
  readonly author: ReviewAuthor;
  readonly rating: Rating;
  readonly comment: string;
  readonly createdAt: IsoDateString;
}
