/**
 * Universal ISO-8601 UTC timestamp utilities for WorkBench entities.
 * Ensures consistent serialization across all domain and persistence layers.
 */
import { ISOTimestamp } from '@/types';

/**
 * Standard ISO-8601 UTC timestamp regex
 */
const ISO_TIMESTAMP_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;

/**
 * Generate a current ISO-8601 UTC timestamp string.
 */
export function createCurrentTimestamp(): ISOTimestamp {
  return new Date().toISOString();
}

/**
 * Validate that a value is a valid ISO-8601 timestamp string.
 */
export function isValidTimestamp(value: unknown): value is ISOTimestamp {
  if (typeof value !== 'string') {
    return false;
  }
  if (!ISO_TIMESTAMP_REGEX.test(value)) {
    return false;
  }
  const timestamp = Date.parse(value);
  return !Number.isNaN(timestamp);
}

/**
 * Compare two ISO timestamps chronologically.
 * Returns negative if a < b, positive if a > b, 0 if equal.
 */
export function compareTimestamps(a: ISOTimestamp, b: ISOTimestamp): number {
  return Date.parse(a) - Date.parse(b);
}
