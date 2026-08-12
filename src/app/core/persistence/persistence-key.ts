declare const persistenceValueType: unique symbol;

export interface PersistenceKey<T> {
  readonly name: string;
  readonly [persistenceValueType]?: T;
}

export const createPersistenceKey = <T>(name: string): PersistenceKey<T> => ({ name });
