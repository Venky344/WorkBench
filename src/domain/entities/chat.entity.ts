import { BaseEntity } from './base.entity';
import { EntityId, ISOTimestamp } from '@/types';
import { ProvenanceRecord } from '../value-objects/provenance';

/**
 * Normalized conversation imported from an external AI platform or created locally.
 */
export interface Chat extends BaseEntity {
  readonly workspaceId: EntityId;
  readonly projectId: EntityId;
  readonly chatGroupId?: EntityId;
  readonly title: string;
  readonly description?: string;
  readonly summary?: string;
  readonly source?: string;
  readonly sourceType?: string;
  readonly sourceId?: EntityId;
  readonly provenance?: ProvenanceRecord;
  readonly isPinned: boolean;
  readonly isFavorite: boolean;
  readonly isArchived: boolean;
  readonly archivedAt?: ISOTimestamp;
  readonly messageCount: number;
  readonly order: number;
  readonly tags: readonly string[];
  readonly lastActivityAt?: ISOTimestamp;
}
