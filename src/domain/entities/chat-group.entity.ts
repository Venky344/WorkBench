import { BaseEntity } from './base.entity';
import { EntityId } from '@/types';

/**
 * Organizational folder/group for categorizing chats within a project.
 */
export interface ChatGroup extends BaseEntity {
  readonly workspaceId: EntityId;
  readonly projectId: EntityId;
  readonly name: string;
  readonly description?: string;
  readonly color?: string;
  readonly order: number;
  readonly isCollapsed: boolean;
}
