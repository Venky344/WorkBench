import { BaseEntity, EntityType } from './base.entity';
import { EntityId } from '@/types';

export type RelationshipType =
  | 'contains'
  | 'references'
  | 'derived_from'
  | 'relates_to'
  | 'implements'
  | 'documents'
  | 'supersedes';

/**
 * Universal relational edge connecting two entities in the WorkBench Brain.
 */
export interface Relationship extends BaseEntity {
  readonly workspaceId: EntityId;
  readonly sourceEntityType: EntityType;
  readonly sourceEntityId: EntityId;
  readonly relationshipType: RelationshipType;
  readonly targetEntityType: EntityType;
  readonly targetEntityId: EntityId;
  readonly metadata?: Readonly<Record<string, string | number | boolean>>;
}
