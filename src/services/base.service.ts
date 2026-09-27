import { ILogger, logger } from '@/utils/logger';

/**
 * Base Service abstraction providing logging and lifecycle hooks.
 */
export abstract class BaseService {
  protected readonly log: ILogger;

  constructor(serviceName: string) {
    this.log = logger.createChild(serviceName);
  }
}
