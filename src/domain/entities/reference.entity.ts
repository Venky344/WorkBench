import { BaseEntity, EntityType } from './base.entity';
import { EntityId } from '@/types';

export type ReferenceKind = 'url' | 'file' | 'citation' | 'internal';

/**
 * Formal reference or citation linking an entity to a primary source or specification.
 */
export interface Reference extends BaseEntity {
  readonly workspaceId: EntityId;
  readonly projectId?: EntityId;
  readonly sourceEntityType: EntityType;
  readonly sourceEntityId: EntityId;
  readonly referenceKind: ReferenceKind;
  readonly title: string;
  readonly targetUri: string;
  readonly annotation?: string;
}
