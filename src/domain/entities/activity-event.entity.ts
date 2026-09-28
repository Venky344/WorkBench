import { BaseEntity, EntityType } from './base.entity';
import { EntityId, ISOTimestamp } from '@/types';

export type ActivityAction =
  | 'created'
  | 'updated'
  | 'imported'
  | 'moved'
  | 'pinned'
  | 'unpinned'
  | 'archived'
  | 'unarchived'
  | 'deleted'
  | 'linked'
  | 'unlinked'
  | 'executed';

/**
 * Append-only structured audit record of actions performed within the workspace.
 */
export interface ActivityEvent extends BaseEntity {
  readonly workspaceId: EntityId;
  readonly projectId?: EntityId;
  readonly entityType: EntityType;
  readonly entityId: EntityId;
  readonly action: ActivityAction;
  readonly summary: string;
  readonly timestamp: ISOTimestamp;
  readonly details?: Readonly<Record<string, unknown>>;
}
