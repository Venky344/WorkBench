import { BaseEntity } from './base.entity';
import { EntityId } from '@/types';

export type DecisionStatus = 'proposed' | 'accepted' | 'superseded' | 'rejected';

/**
 * Structured architectural, product, or engineering decision record.
 */
export interface Decision extends BaseEntity {
  readonly workspaceId: EntityId;
  readonly projectId: EntityId;
  readonly title: string;
  readonly status: DecisionStatus;
  readonly decision: string;
  readonly rationale: string;
  readonly implications?: string;
  readonly sourceChatId?: EntityId;
  readonly sourceMessageId?: EntityId;
  readonly tags: readonly string[];
}
