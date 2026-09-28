import { EntityId, ISOTimestamp } from '@/types';

/**
 * Universal base contract for all persistent WorkBench domain entities.
 */
export interface BaseEntity {
  readonly id: EntityId;
  readonly createdAt: ISOTimestamp;
  readonly updatedAt: ISOTimestamp;
}

/**
 * Common entity type discriminant
 */
export type EntityType =
  | 'workspace'
  | 'user'
  | 'project'
  | 'chat'
  | 'message'
  | 'chat_group'
  | 'file'
  | 'note'
  | 'link'
  | 'bookmark'
  | 'reference'
  | 'code_snippet'
  | 'task'
  | 'decision'
  | 'tag'
  | 'source'
  | 'relationship'
  | 'activity_event'
  | 'inbox_item'
  | 'automation'
  | 'project_template';
