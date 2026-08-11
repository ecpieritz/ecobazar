import { EntityId } from './common.model';

export type AddressType = 'billing' | 'shipping';

export interface Address {
  readonly id: EntityId;
  readonly type: AddressType;
  readonly firstName: string;
  readonly lastName: string;
  readonly company?: string;
  readonly street: string;
  readonly city: string;
  readonly state: string;
  readonly postalCode: string;
  readonly country: string;
  readonly email: string;
  readonly phone: string;
  readonly isDefault: boolean;
}
