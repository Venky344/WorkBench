import { describe, it, expect } from 'vitest';
import {
  generateEntityId,
  isValidEntityId,
  createCurrentTimestamp,
  isValidTimestamp,
  compareTimestamps,
} from '@/domain/value-objects';
import {
  validateBaseEntity,
  validateNonEmptyString,
  validateEntityType,
  validateOptionalEntityId,
} from '@/domain/validation';
import { ValidationError } from '@/utils/errors';
import { BaseEntity } from '@/domain/entities';

describe('Domain Value Objects & Validation', () => {
  describe('EntityId', () => {
    it('generates valid UUID v4 entity IDs', () => {
      const id1 = generateEntityId();
      const id2 = generateEntityId();

      expect(id1).toBeDefined();
      expect(typeof id1).toBe('string');
      expect(isValidEntityId(id1)).toBe(true);
      expect(isValidEntityId(id2)).toBe(true);
      expect(id1).not.toBe(id2);
    });

    it('rejects invalid or malformed IDs', () => {
      expect(isValidEntityId('')).toBe(false);
      expect(isValidEntityId('12345')).toBe(false);
      expect(isValidEntityId('invalid-uuid-format')).toBe(false);
      expect(isValidEntityId(null)).toBe(false);
      expect(isValidEntityId(undefined)).toBe(false);
      expect(isValidEntityId(123)).toBe(false);
    });
  });

  describe('ISOTimestamp', () => {
    it('creates valid ISO-8601 UTC timestamps', () => {
      const ts = createCurrentTimestamp();
      expect(isValidTimestamp(ts)).toBe(true);
      expect(ts.endsWith('Z')).toBe(true);
    });

    it('rejects invalid timestamps', () => {
      expect(isValidTimestamp('not-a-date')).toBe(false);
      expect(isValidTimestamp('')).toBe(false);
      expect(isValidTimestamp(123456789)).toBe(false);
      expect(isValidTimestamp(null)).toBe(false);
    });

    it('compares timestamps chronologically', () => {
      const earlier = '2026-01-01T00:00:00.000Z';
      const later = '2026-09-28T12:00:00.000Z';

      expect(compareTimestamps(earlier, later)).toBeLessThan(0);
      expect(compareTimestamps(later, earlier)).toBeGreaterThan(0);
      expect(compareTimestamps(earlier, earlier)).toBe(0);
    });
  });

  describe('Validation Functions', () => {
    it('validates a valid BaseEntity', () => {
      const validEntity: BaseEntity = {
        id: generateEntityId(),
        createdAt: createCurrentTimestamp(),
        updatedAt: createCurrentTimestamp(),
      };

      expect(() => validateBaseEntity(validEntity)).not.toThrow();
    });

    it('throws ValidationError for non-object entity', () => {
      expect(() => validateBaseEntity(null)).toThrow(ValidationError);
      expect(() => validateBaseEntity('string')).toThrow(ValidationError);
    });

    it('throws ValidationError for invalid ID in BaseEntity', () => {
      const invalid = {
        id: 'bad-id',
        createdAt: createCurrentTimestamp(),
        updatedAt: createCurrentTimestamp(),
      };
      expect(() => validateBaseEntity(invalid)).toThrow(ValidationError);
    });

    it('throws ValidationError for invalid timestamps in BaseEntity', () => {
      const invalid = {
        id: generateEntityId(),
        createdAt: 'invalid-date',
        updatedAt: createCurrentTimestamp(),
      };
      expect(() => validateBaseEntity(invalid)).toThrow(ValidationError);
    });

    it('validates non-empty string and trims whitespace', () => {
      expect(validateNonEmptyString('  Test Project  ', 'Name')).toBe('Test Project');
      expect(() => validateNonEmptyString('', 'Name')).toThrow(ValidationError);
      expect(() => validateNonEmptyString('   ', 'Name')).toThrow(ValidationError);
      expect(() => validateNonEmptyString(null, 'Name')).toThrow(ValidationError);
    });

    it('validates entity types', () => {
      expect(() => validateEntityType('project')).not.toThrow();
      expect(() => validateEntityType('chat')).not.toThrow();
      expect(() => validateEntityType('task')).not.toThrow();
      expect(() => validateEntityType('invalid_type')).toThrow(ValidationError);
    });

    it('validates optional entity ID', () => {
      expect(() => validateOptionalEntityId(undefined, 'parentId')).not.toThrow();
      expect(() => validateOptionalEntityId(null, 'parentId')).not.toThrow();
      expect(() => validateOptionalEntityId(generateEntityId(), 'parentId')).not.toThrow();
      expect(() => validateOptionalEntityId('bad-uuid', 'parentId')).toThrow(ValidationError);
    });
  });
});
