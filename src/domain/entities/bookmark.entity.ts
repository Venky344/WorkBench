import { BaseEntity, EntityType } from './base.entity';
import { EntityId } from '@/types';

/**
 * Fast navigation pointer / saved bookmark referencing an internal entity or external target.
 */
export interface Bookmark extends BaseEntity {
  readonly workspaceId: EntityId;
  readonly projectId?: EntityId;
  readonly title: string;
  readonly targetEntityType: EntityType;
  readonly targetEntityId: EntityId;
  readonly targetUrl?: string;
  readonly note?: string;
  readonly order: number;
  readonly tags?: readonly string[];
}
