export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';

const LOG_LEVEL_WEIGHTS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  silent: 4,
};

export interface LoggerOptions {
  level?: LogLevel;
  prefix?: string;
}

export interface ILogger {
  debug(message: string, ...meta: unknown[]): void;
  info(message: string, ...meta: unknown[]): void;
  warn(message: string, ...meta: unknown[]): void;
  error(message: string, ...meta: unknown[]): void;
  setLevel(level: LogLevel): void;
  getLevel(): LogLevel;
  createChild(prefix: string): ILogger;
}

export class Logger implements ILogger {
  private level: LogLevel;
  private prefix: string;

  constructor(options: LoggerOptions = {}) {
    this.level = options.level ?? 'info';
    this.prefix = options.prefix ?? 'WorkBench';
  }

  public setLevel(level: LogLevel): void {
    this.level = level;
  }

  public getLevel(): LogLevel {
    return this.level;
  }

  public createChild(prefix: string): ILogger {
    const combinedPrefix = this.prefix ? `${this.prefix}:${prefix}` : prefix;
    return new Logger({ level: this.level, prefix: combinedPrefix });
  }

  private shouldLog(targetLevel: LogLevel): boolean {
    return LOG_LEVEL_WEIGHTS[targetLevel] >= LOG_LEVEL_WEIGHTS[this.level];
  }

  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}] [${this.prefix}] ${message}`;
  }

  public debug(message: string, ...meta: unknown[]): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message), ...meta);
    }
  }

  public info(message: string, ...meta: unknown[]): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message), ...meta);
    }
  }

  public warn(message: string, ...meta: unknown[]): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message), ...meta);
    }
  }

  public error(message: string, ...meta: unknown[]): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message), ...meta);
    }
  }
}

export const logger = new Logger({
  level: (import.meta.env.VITE_LOG_LEVEL as LogLevel) || 'info',
  prefix: 'WorkBench',
});
