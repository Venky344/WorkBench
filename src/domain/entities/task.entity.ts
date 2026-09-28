import { BaseEntity } from './base.entity';
import { EntityId, ISOTimestamp } from '@/types';

export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

/**
 * Actionable task linked to projects, chats, files, and decisions.
 */
export interface Task extends BaseEntity {
  readonly workspaceId: EntityId;
  readonly projectId: EntityId;
  readonly title: string;
  readonly description?: string;
  readonly status: TaskStatus;
  readonly priority: TaskPriority;
  readonly dueDate?: ISOTimestamp;
  readonly completedAt?: ISOTimestamp;
  readonly sourceChatId?: EntityId;
  readonly sourceMessageId?: EntityId;
  readonly decisionId?: EntityId;
  readonly order: number;
  readonly tags: readonly string[];
}
