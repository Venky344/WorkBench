import { describe, it, expect } from 'vitest';
import { appConfig } from '@/app/config/app.config';
import { env } from '@/utils/env';

describe('Application Configuration & Environment', () => {
  it('should load valid app configuration', () => {
    expect(appConfig.name).toBe('WorkBench');
    expect(appConfig.version).toBe('0.1.0');
    expect(appConfig.search.defaultLimit).toBeGreaterThan(0);
    expect(appConfig.features.enableQuickCapture).toBe(true);
    expect(Object.isFrozen(appConfig)).toBe(true);
  });

  it('should safely parse environment variables', () => {
    expect(env.APP_ENV).toBeDefined();
    expect(['development', 'test', 'production']).toContain(env.APP_ENV);
    expect(env.LOG_LEVEL).toBeDefined();
    expect(Object.isFrozen(env)).toBe(true);
  });
});
