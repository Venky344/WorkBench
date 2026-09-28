import { EntityId } from '@/types';
import { BaseEntity } from './entities/base.entity';
import { ProvenanceRecord } from './value-objects/provenance';

export * from './entities';
export * from './value-objects';
export * from './validation';

/**
 * Backwards compatibility stubs for Phase 1-3 imports
 */
export interface WorkspaceStub extends BaseEntity {
  readonly name: string;
  readonly activeProjectId?: EntityId;
}

export interface ProjectStub extends BaseEntity {
  readonly workspaceId: EntityId;
  readonly name: string;
  readonly description?: string;
  readonly color?: string;
  readonly isArchived: boolean;
}

export interface ConversationStub extends BaseEntity {
  readonly projectId?: EntityId;
  readonly title: string;
  readonly provenance?: ProvenanceRecord;
  readonly isPinned: boolean;
}
