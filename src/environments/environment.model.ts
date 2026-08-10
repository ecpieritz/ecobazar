export interface Environment {
  readonly production: boolean;
  readonly apiBaseUrl: string;
  readonly mockApi: {
    readonly enabled: boolean;
    readonly delayMs: number;
  };
}
