import { env } from '@/utils/env';

export interface AppConfig {
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly environment: 'development' | 'test' | 'production';
  readonly isDesktop: boolean;
  readonly search: {
    readonly defaultLimit: number;
    readonly maxQueryLength: number;
  };
  readonly features: {
    readonly enableQuickCapture: boolean;
    readonly enableAutomations: boolean;
    readonly enableInbox: boolean;
  };
}

export const appConfig: AppConfig = Object.freeze({
  name: 'WorkBench',
  version: '0.1.0',
  description: 'A lightweight personal digital work area',
  environment: env.APP_ENV,
  isDesktop: false, // Flag for future desktop runtime detection
  search: {
    defaultLimit: 50,
    maxQueryLength: 200,
  },
  features: {
    enableQuickCapture: true,
    enableAutomations: true,
    enableInbox: true,
  },
});
