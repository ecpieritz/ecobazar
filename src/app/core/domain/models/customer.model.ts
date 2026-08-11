import { Address } from './address.model';
import { EntityId, IsoDateString } from './common.model';

export interface Customer {
  readonly id: EntityId;
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly phone?: string;
  readonly avatarUrl?: string;
  readonly addresses: readonly Address[];
  readonly createdAt: IsoDateString;
  readonly updatedAt: IsoDateString;
}
