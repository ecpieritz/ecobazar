export type EntityId = string;
export type IsoDateString = string;
export type CurrencyCode = 'USD';
export type Rating = 1 | 2 | 3 | 4 | 5;

export interface Money {
  readonly amount: number;
  readonly currency: CurrencyCode;
}

export interface ImageAsset {
  readonly src: string;
  readonly alt: string;
}

export interface RatingSummary {
  readonly average: number;
  readonly count: number;
}
