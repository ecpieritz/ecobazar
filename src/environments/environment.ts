import type { Environment } from '@environments/environment.model';

export const environment = {
  production: true,
  apiBaseUrl: '/api',
  mockApi: {
    enabled: true,
    delayMs: 0,
  },
} as const satisfies Environment;
