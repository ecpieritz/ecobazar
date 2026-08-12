import { inject, Injectable } from '@angular/core';

import { LOCAL_STORAGE } from './local-storage.token';
import type { PersistenceKey } from './persistence-key';

const STORAGE_NAMESPACE = 'ecobazar:';

@Injectable({ providedIn: 'root' })
export class LocalStorageService {
  private readonly storage = inject(LOCAL_STORAGE);

  get<T>(key: PersistenceKey<T>): T | null {
    const serializedValue = this.read(key);

    if (serializedValue === null) {
      return null;
    }

    try {
      return JSON.parse(serializedValue) as T;
    } catch {
      this.remove(key);
      return null;
    }
  }

  set<T>(key: PersistenceKey<T>, value: T): boolean {
    try {
      this.storage?.setItem(this.namespacedKey(key), JSON.stringify(value));
      return this.storage !== null;
    } catch {
      return false;
    }
  }

  has(key: PersistenceKey<unknown>): boolean {
    return this.read(key) !== null;
  }

  remove(key: PersistenceKey<unknown>): boolean {
    try {
      this.storage?.removeItem(this.namespacedKey(key));
      return this.storage !== null;
    } catch {
      return false;
    }
  }

  clear(): boolean {
    if (this.storage === null) {
      return false;
    }

    try {
      const applicationKeys = Array.from({ length: this.storage.length }, (_, index) =>
        this.storage?.key(index),
      ).filter((key): key is string => key?.startsWith(STORAGE_NAMESPACE) ?? false);

      applicationKeys.forEach((key) => this.storage?.removeItem(key));
      return true;
    } catch {
      return false;
    }
  }

  private read(key: PersistenceKey<unknown>): string | null {
    try {
      return this.storage?.getItem(this.namespacedKey(key)) ?? null;
    } catch {
      return null;
    }
  }

  private namespacedKey(key: PersistenceKey<unknown>): string {
    return `${STORAGE_NAMESPACE}${key.name}`;
  }
}
