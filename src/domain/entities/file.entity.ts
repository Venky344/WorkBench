import { BaseEntity } from './base.entity';
import { EntityId, ISOTimestamp } from '@/types';
import { ProvenanceRecord } from '../value-objects/provenance';

/**
 * Metadata record for a file attached to a project or workspace.
 * Note: Actual binary contents are not stored directly in this entity.
 */
export interface FileEntity extends BaseEntity {
  readonly workspaceId: EntityId;
  readonly projectId?: EntityId;
  readonly name: string;
  readonly originalFilename: string;
  readonly mimeType: string;
  readonly sizeBytes: number;
  readonly pathOrReference: string;
  readonly description?: string;
  readonly sourceId?: EntityId;
  readonly provenance?: ProvenanceRecord;
  readonly tags: readonly string[];
  readonly isArchived: boolean;
  readonly archivedAt?: ISOTimestamp;
}
