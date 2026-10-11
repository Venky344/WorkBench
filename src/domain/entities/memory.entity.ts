import { BaseEntity, EntityType } from './base.entity';
import { EntityId, ISOTimestamp } from '@/types';

export type MemoryType =
  'fact' | 'goal' | 'constraint' | 'preference' | 'decision' | 'key_context' | 'note';

export type MemoryStatus = 'active' | 'archived';

export type MemoryImportance = 'low' | 'medium' | 'high' | 'critical';

/**
 * Pointer reference linking a memory item to a supporting source entity in WorkBench.
 */
export interface MemorySourceReference {
  readonly entityType: EntityType;
  readonly entityId: EntityId;
  readonly title?: string;
  readonly excerpt?: string;
}

/**
 * Structured project memory item preserving vital context, constraints, goals, and facts.
 */
export interface MemoryItem extends BaseEntity {
  readonly entityType?: EntityType;
  readonly workspaceId: EntityId;
  readonly projectId: EntityId;
  readonly title: string;
  readonly content: string;
  readonly type: MemoryType;
  readonly importance: MemoryImportance;
  readonly status: MemoryStatus;
  readonly sourceReferences?: readonly MemorySourceReference[];
  readonly tags: readonly string[];
  readonly reviewDate?: ISOTimestamp;
  readonly archivedAt?: ISOTimestamp;
  readonly order: number;
}
