import { BaseEntity, EntityType } from './base.entity';
import { EntityId, ISOTimestamp } from '@/types';

export interface AutomationTrigger {
  readonly type: 'entity_created' | 'entity_imported' | 'tag_added' | 'status_changed';
  readonly targetEntityType?: EntityType;
  readonly config?: Readonly<Record<string, string | number | boolean>>;
}

export interface AutomationCondition {
  readonly field: string;
  readonly operator:
    'equals' | 'not_equals' | 'contains' | 'starts_with' | 'is_empty' | 'is_not_empty';
  readonly value: string | number | boolean;
}

export interface AutomationActionPayload {
  readonly type: 'assign_project' | 'add_tag' | 'set_status' | 'log_activity' | 'create_task';
  readonly payload: Readonly<Record<string, unknown>>;
}

/**
 * Deterministic automation rule following WHEN -> IF -> THEN.
 */
export interface Automation extends BaseEntity {
  readonly workspaceId: EntityId;
  readonly projectId?: EntityId;
  readonly name: string;
  readonly description?: string;
  readonly isEnabled: boolean;
  readonly trigger: AutomationTrigger;
  readonly conditions: readonly AutomationCondition[];
  readonly actions: readonly AutomationActionPayload[];
  readonly lastRunAt?: ISOTimestamp;
  readonly runCount: number;
}
