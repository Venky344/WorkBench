/**
 * Base Application Error class for structured, recoverable error handling.
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly details?: unknown;
  public readonly recoverable: boolean;
  public readonly timestamp: string;

  constructor(
    message: string,
    options: {
      code?: string;
      details?: unknown;
      recoverable?: boolean;
    } = {},
  ) {
    super(message);
    this.name = 'AppError';
    this.code = options.code ?? 'INTERNAL_ERROR';
    this.details = options.details;
    this.recoverable = options.recoverable ?? true;
    this.timestamp = new Date().toISOString();

    // Maintain proper prototype chain
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ConfigurationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, { code: 'CONFIGURATION_ERROR', details, recoverable: false });
    this.name = 'ConfigurationError';
  }
}

export class NotFoundError extends AppError {
  constructor(entityName: string, entityId: string) {
    super(`${entityName} with id '${entityId}' was not found.`, {
      code: 'NOT_FOUND',
      details: { entityName, entityId },
      recoverable: true,
    });
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, { code: 'VALIDATION_ERROR', details, recoverable: true });
    this.name = 'ValidationError';
  }
}

export class StorageError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, { code: 'STORAGE_ERROR', details, recoverable: true });
    this.name = 'StorageError';
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, { code: 'DATABASE_ERROR', details, recoverable: true });
    this.name = 'DatabaseError';
  }
}

export class SerializationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, { code: 'SERIALIZATION_ERROR', details, recoverable: true });
    this.name = 'SerializationError';
  }
}
