import { TestBed } from '@angular/core/testing';

import { LocalStorageService } from './local-storage.service';
import { LOCAL_STORAGE } from './local-storage.token';
import { createPersistenceKey } from './persistence-key';

interface PersistedPreferences {
  readonly currency: string;
  readonly compactView: boolean;
}

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>();

  get length(): number {
    return this.values.size;
  }

  clear(): void {
    this.values.clear();
  }

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  key(index: number): string | null {
    return [...this.values.keys()][index] ?? null;
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

describe('LocalStorageService', () => {
  const preferencesKey = createPersistenceKey<PersistedPreferences>('preferences');
  let storage: MemoryStorage;
  let service: LocalStorageService;

  beforeEach(() => {
    storage = new MemoryStorage();
    TestBed.configureTestingModule({
      providers: [LocalStorageService, { provide: LOCAL_STORAGE, useValue: storage }],
    });
    service = TestBed.inject(LocalStorageService);
  });

  it('should persist and restore typed JSON values in the application namespace', () => {
    const preferences: PersistedPreferences = { currency: 'USD', compactView: true };

    expect(service.set(preferencesKey, preferences)).toBe(true);
    expect(storage.getItem('ecobazar:preferences')).toBe(JSON.stringify(preferences));
    expect(service.get(preferencesKey)).toEqual(preferences);
    expect(service.has(preferencesKey)).toBe(true);
  });

  it('should preserve falsy primitive values', () => {
    const enabledKey = createPersistenceKey<boolean>('enabled');
    const countKey = createPersistenceKey<number>('count');
    const searchKey = createPersistenceKey<string>('search');

    expect(service.set(enabledKey, false)).toBe(true);
    expect(service.set(countKey, 0)).toBe(true);
    expect(service.set(searchKey, '')).toBe(true);

    expect(service.get(enabledKey)).toBe(false);
    expect(service.get(countKey)).toBe(0);
    expect(service.get(searchKey)).toBe('');
  });

  it('should remove a persisted value', () => {
    service.set(preferencesKey, { currency: 'USD', compactView: false });

    expect(service.remove(preferencesKey)).toBe(true);
    expect(service.get(preferencesKey)).toBeNull();
    expect(service.has(preferencesKey)).toBe(false);
  });

  it('should discard malformed JSON without throwing', () => {
    storage.setItem('ecobazar:preferences', '{invalid');

    expect(service.get(preferencesKey)).toBeNull();
    expect(storage.getItem('ecobazar:preferences')).toBeNull();
  });

  it('should clear only application-owned values', () => {
    storage.setItem('external:preferences', 'keep-me');
    service.set(preferencesKey, { currency: 'USD', compactView: true });
    service.set(createPersistenceKey<number>('cart-version'), 2);

    expect(service.clear()).toBe(true);
    expect(storage.getItem('ecobazar:preferences')).toBeNull();
    expect(storage.getItem('ecobazar:cart-version')).toBeNull();
    expect(storage.getItem('external:preferences')).toBe('keep-me');
  });

  it('should degrade safely when browser storage is unavailable', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [LocalStorageService, { provide: LOCAL_STORAGE, useValue: null }],
    });
    const unavailableService = TestBed.inject(LocalStorageService);

    expect(unavailableService.get(preferencesKey)).toBeNull();
    expect(unavailableService.has(preferencesKey)).toBe(false);
    expect(unavailableService.set(preferencesKey, { currency: 'USD', compactView: false })).toBe(
      false,
    );
    expect(unavailableService.remove(preferencesKey)).toBe(false);
    expect(unavailableService.clear()).toBe(false);
  });

  it('should report storage write failures without throwing', () => {
    const writeError = new DOMException('Quota exceeded', 'QuotaExceededError');
    storage.setItem = (): void => {
      throw writeError;
    };

    expect(service.set(preferencesKey, { currency: 'USD', compactView: false })).toBe(false);
  });

  it('should report serialization failures without writing partial data', () => {
    const circularValue: { self?: unknown } = {};
    circularValue.self = circularValue;
    const circularKey = createPersistenceKey<typeof circularValue>('circular');

    expect(service.set(circularKey, circularValue)).toBe(false);
    expect(storage.getItem('ecobazar:circular')).toBeNull();
  });

  it('should handle storage read failures as missing values', () => {
    storage.getItem = (): string | null => {
      throw new DOMException('Storage blocked', 'SecurityError');
    };

    expect(service.get(preferencesKey)).toBeNull();
    expect(service.has(preferencesKey)).toBe(false);
  });

  it('should report remove and clear failures without throwing', () => {
    storage.removeItem = (): void => {
      throw new DOMException('Storage blocked', 'SecurityError');
    };
    service.set(preferencesKey, { currency: 'USD', compactView: false });

    expect(service.remove(preferencesKey)).toBe(false);
    expect(service.clear()).toBe(false);
  });
});
