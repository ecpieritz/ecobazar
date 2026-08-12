import { DOCUMENT } from '@angular/common';
import { inject, InjectionToken } from '@angular/core';

const getBrowserLocalStorage = (): Storage | null => {
  const document = inject(DOCUMENT);

  try {
    return document.defaultView?.localStorage ?? null;
  } catch {
    return null;
  }
};

export const LOCAL_STORAGE = new InjectionToken<Storage | null>('Browser local storage', {
  providedIn: 'root',
  factory: getBrowserLocalStorage,
});
