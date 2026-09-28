import { BaseEntity, EntityType } from './base.entity';
import { EntityId, ISOTimestamp } from '@/types';
import { ProvenanceRecord } from '../value-objects/provenance';

export type InboxCaptureType =
  'raw_text' | 'snippet' | 'url' | 'imported_chat' | 'imported_file' | 'clipboard';

export type InboxStatus = 'unprocessed' | 'triaged' | 'archived';

/**
 * Staging container representing incoming or captured content pending triage.
 */
export interface InboxItem extends BaseEntity {
  readonly workspaceId: EntityId;
  readonly title: string;
  readonly captureType: InboxCaptureType;
  readonly rawContent?: string;
  readonly targetEntityType?: EntityType;
  readonly targetEntityId?: EntityId;
  readonly sourceUrl?: string;
  readonly sourceId?: EntityId;
  readonly provenance?: ProvenanceRecord;
  readonly suggestedProjectId?: EntityId;
  readonly suggestedTags: readonly string[];
  readonly status: InboxStatus;
  readonly triagedAt?: ISOTimestamp;
}
