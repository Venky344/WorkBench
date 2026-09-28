import { BaseEntity } from './base.entity';
import { EntityId, ISOTimestamp } from '@/types';
import { ProvenanceRecord } from '../value-objects/provenance';

/**
 * Text or Markdown note within a project or workspace.
 */
export interface Note extends BaseEntity {
  readonly workspaceId: EntityId;
  readonly projectId?: EntityId;
  readonly title: string;
  readonly content: string;
  readonly isPinned: boolean;
  readonly isArchived: boolean;
  readonly archivedAt?: ISOTimestamp;
  readonly sourceId?: EntityId;
  readonly provenance?: ProvenanceRecord;
  readonly tags: readonly string[];
}
