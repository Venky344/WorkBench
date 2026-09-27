import { LogLevel } from './logger';

export interface EnvironmentVariables {
  readonly APP_ENV: 'development' | 'test' | 'production';
  readonly LOG_LEVEL: LogLevel;
  readonly ENABLE_DEV_TOOLS: boolean;
  readonly IS_DEV: boolean;
  readonly IS_PROD: boolean;
  readonly IS_TEST: boolean;
}

export const getEnvironment = (): EnvironmentVariables => {
  const rawEnv = import.meta.env.VITE_APP_ENV || import.meta.env.MODE || 'development';
  const appEnv =
    rawEnv === 'production' ? 'production' : rawEnv === 'test' ? 'test' : 'development';

  const rawLogLevel = (import.meta.env.VITE_LOG_LEVEL as LogLevel) || 'info';
  const validLogLevels: LogLevel[] = ['debug', 'info', 'warn', 'error', 'silent'];
  const logLevel = validLogLevels.includes(rawLogLevel) ? rawLogLevel : 'info';

  const enableDevTools =
    import.meta.env.VITE_ENABLE_DEV_TOOLS === 'true' || appEnv === 'development';

  return Object.freeze({
    APP_ENV: appEnv,
    LOG_LEVEL: logLevel,
    ENABLE_DEV_TOOLS: enableDevTools,
    IS_DEV: appEnv === 'development',
    IS_PROD: appEnv === 'production',
    IS_TEST: appEnv === 'test',
  });
};

export const env = getEnvironment();
