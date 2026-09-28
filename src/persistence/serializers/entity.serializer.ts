import { BaseEntity } from '@/domain/entities/base.entity';
import { validateBaseEntity } from '@/domain/validation/entity.validator';
import { SerializationError } from '@/utils/errors';

/**
 * Pure serialization utility ensuring domain records cross persistence boundaries safely.
 */
export class EntitySerializer {
  /**
   * Serialize a domain entity into a clean, plain object suitable for storage.
   */
  static serialize<T extends BaseEntity>(entity: T): Record<string, unknown> {
    try {
      validateBaseEntity(entity);
      // Perform structured clone / JSON roundtrip to strip any runtime prototypes or non-serializable fields
      const json = JSON.stringify(entity);
      return JSON.parse(json) as Record<string, unknown>;
    } catch (error) {
      throw new SerializationError(
        `Failed to serialize entity: ${error instanceof Error ? error.message : String(error)}`,
        error,
      );
    }
  }

  /**
   * Deserialize a raw storage record into a validated, immutable domain entity.
   */
  static deserialize<T extends BaseEntity>(record: unknown): T {
    try {
      if (!record || typeof record !== 'object') {
        throw new SerializationError('Deserialization target must be an object');
      }

      validateBaseEntity(record);

      // Return a deep-frozen shallow-immutable object
      return Object.freeze({ ...(record as T) });
    } catch (error) {
      throw new SerializationError(
        `Failed to deserialize entity record: ${error instanceof Error ? error.message : String(error)}`,
        error,
      );
    }
  }

  /**
   * Batch serialize multiple entities
   */
  static serializeBatch<T extends BaseEntity>(
    entities: readonly T[],
  ): readonly Record<string, unknown>[] {
    return entities.map((e) => this.serialize(e));
  }

  /**
   * Batch deserialize multiple records
   */
  static deserializeBatch<T extends BaseEntity>(records: readonly unknown[]): readonly T[] {
    return records.map((r) => this.deserialize<T>(r));
  }
}
