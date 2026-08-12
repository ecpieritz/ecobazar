import { environment } from '@environments/environment';

const trimTrailingSlashes = (value: string): string => value.replace(/\/+$/, '');

export const apiUrl = (endpoint: string): string => {
  const baseUrl = trimTrailingSlashes(environment.apiBaseUrl);
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  return `${baseUrl}${normalizedEndpoint}`;
};
