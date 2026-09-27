import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Logger } from '@/utils/logger';

describe('Structured Logger', () => {
  let logger: Logger;

  beforeEach(() => {
    logger = new Logger({ level: 'debug', prefix: 'TestPrefix' });
    vi.restoreAllMocks();
  });

  it('should format and emit debug logs when level allows', () => {
    const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    logger.debug('Debug message test');

    expect(debugSpy).toHaveBeenCalledTimes(1);
    expect(debugSpy.mock.calls[0]?.[0]).toContain('[DEBUG]');
    expect(debugSpy.mock.calls[0]?.[0]).toContain('[TestPrefix]');
    expect(debugSpy.mock.calls[0]?.[0]).toContain('Debug message test');
  });

  it('should suppress lower-level logs when level is set to error', () => {
    logger.setLevel('error');
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    logger.info('Should not be logged');
    logger.error('Critical failure');

    expect(infoSpy).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledTimes(1);
  });

  it('should create child logger with combined prefix', () => {
    const child = logger.createChild('ChildService');
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

    child.info('Child log');
    expect(infoSpy).toHaveBeenCalledTimes(1);
    expect(infoSpy.mock.calls[0]?.[0]).toContain('[TestPrefix:ChildService]');
  });
});
