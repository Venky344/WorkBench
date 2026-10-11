import { EntityId, ISOTimestamp } from '@/types';
import {
  MemoryItem,
  MemoryType,
  MemoryStatus,
  MemoryImportance,
  MemorySourceReference,
  EntityType,
} from '../entities';

/**
 * Resolved metadata for a supporting source entity linked to a memory item.
 */
export interface ResolvedMemorySource {
  readonly entityType: EntityType;
  readonly entityId: EntityId;
  readonly title?: string;
  readonly excerpt?: string;
  readonly subtitle?: string;
  readonly exists: boolean;
  readonly route?: string;
  readonly targetRoute?: string;
  readonly reference?: MemorySourceReference;
}

/**
 * Assembled, read-only memory context for a project.
 */
export interface ProjectMemoryContext {
  readonly projectId: EntityId;
  readonly workspaceId?: EntityId;
  readonly projectName?: string;
  readonly activeMemories: readonly MemoryItem[];
  readonly archivedMemories: readonly MemoryItem[];
  readonly byType: Record<MemoryType, readonly MemoryItem[]>;
  readonly byImportance: Record<MemoryImportance, readonly MemoryItem[]>;
  readonly criticalAndHigh: readonly MemoryItem[];
  readonly dueForReview: readonly MemoryItem[];
  readonly reviewDueItems?: readonly MemoryItem[];
  readonly totalActiveCount?: number;
  readonly totalArchivedCount?: number;
  readonly reviewDueCount?: number;
  readonly highImportanceCount?: number;
  readonly counts: {
    readonly total: number;
    readonly active: number;
    readonly archived: number;
    readonly critical: number;
    readonly dueForReview: number;
    readonly byType: Record<MemoryType, number>;
  };
}

/**
 * Input DTO for creating a new memory item.
 */
export interface CreateMemoryInput {
  readonly workspaceId: EntityId;
  readonly projectId: EntityId;
  readonly title: string;
  readonly content: string;
  readonly type?: MemoryType;
  readonly importance?: MemoryImportance;
  readonly sourceReferences?: readonly MemorySourceReference[];
  readonly tags?: readonly string[];
  readonly reviewDate?: ISOTimestamp;
}

/**
 * Input DTO for updating an existing memory item.
 */
export interface UpdateMemoryInput {
  readonly title?: string;
  readonly content?: string;
  readonly type?: MemoryType;
  readonly importance?: MemoryImportance;
  readonly status?: MemoryStatus;
  readonly sourceReferences?: readonly MemorySourceReference[];
  readonly tags?: readonly string[];
  readonly reviewDate?: ISOTimestamp | null;
  readonly workspaceId?: EntityId;
  readonly id?: EntityId;
}

/**
 * Filter and sorting criteria for querying project memory items.
 */
export interface MemoryFilterOptions {
  readonly type?: MemoryType | 'all';
  readonly status?: MemoryStatus | 'all';
  readonly importance?: MemoryImportance | 'all';
  readonly tag?: string;
  readonly tags?: readonly string[];
  readonly searchQuery?: string;
  readonly isDueForReview?: boolean;
  readonly sortBy?: 'updatedAt' | 'createdAt' | 'importance' | 'title' | 'reviewDate';
  readonly sortOrder?: 'asc' | 'desc';
}
