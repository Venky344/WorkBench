/**
 * Universal ID generation and validation for WorkBench entities.
 * Uses standard crypto.randomUUID() when available.
 */
import { EntityId } from '@/types';

/**
 * Standard UUID v4 regex pattern for validation
 */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Generate a new globally unique, stable EntityId.
 */
export function generateEntityId(): EntityId {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  // Deterministic fallback if crypto.randomUUID is not available in legacy runtimes
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Validate that a string conforms to a valid EntityId format.
 */
export function isValidEntityId(id: unknown): id is EntityId {
  return typeof id === 'string' && id.trim().length > 0 && UUID_REGEX.test(id);
}
