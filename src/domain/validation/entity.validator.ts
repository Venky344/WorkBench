import { BaseEntity, EntityType } from '../entities/base.entity';
import { isValidEntityId } from '../value-objects/id';
import { isValidTimestamp } from '../value-objects/timestamp';
import { ValidationError } from '@/utils/errors';

/**
 * Validates that an object conforms to the BaseEntity contract.
 */
export function validateBaseEntity(entity: unknown): asserts entity is BaseEntity {
  if (!entity || typeof entity !== 'object') {
    throw new ValidationError('Entity must be a non-null object');
  }

  const candidate = entity as Record<string, unknown>;

  if (!isValidEntityId(candidate.id)) {
    throw new ValidationError(`Invalid entity ID: ${String(candidate.id)}`);
  }

  if (!isValidTimestamp(candidate.createdAt)) {
    throw new ValidationError(`Invalid createdAt timestamp: ${String(candidate.createdAt)}`);
  }

  if (!isValidTimestamp(candidate.updatedAt)) {
    throw new ValidationError(`Invalid updatedAt timestamp: ${String(candidate.updatedAt)}`);
  }
}

/**
 * Validates string property is non-empty after trimming.
 */
export function validateNonEmptyString(value: unknown, fieldName: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new ValidationError(`${fieldName} must be a non-empty string`);
  }
  return value.trim();
}

/**
 * Validates that an optional EntityId, if present, is valid.
 */
export function validateOptionalEntityId(id: unknown, fieldName: string): void {
  if (id !== undefined && id !== null && !isValidEntityId(id)) {
    throw new ValidationError(`${fieldName} must be a valid EntityId or undefined`);
  }
}

/**
 * Validates that an EntityType is a known entity type.
 */
const VALID_ENTITY_TYPES: ReadonlySet<string> = new Set<EntityType>([
  'workspace',
  'user',
  'project',
  'chat',
  'message',
  'chat_group',
  'file',
  'note',
  'link',
  'bookmark',
  'reference',
  'code_snippet',
  'task',
  'decision',
  'tag',
  'source',
  'relationship',
  'activity_event',
  'inbox_item',
  'automation',
  'project_template',
]);

export function isValidEntityType(type: unknown): type is EntityType {
  return typeof type === 'string' && VALID_ENTITY_TYPES.has(type);
}

export function validateEntityType(
  type: unknown,
  fieldName = 'entityType',
): asserts type is EntityType {
  if (!isValidEntityType(type)) {
    throw new ValidationError(`Invalid ${fieldName}: ${String(type)}`);
  }
}
