import type { Environment } from '@environments/environment.model';

export const environment = {
  production: false,
  apiBaseUrl: '/api',
  mockApi: {
    enabled: true,
    delayMs: 350,
  },
} as const satisfies Environment;
