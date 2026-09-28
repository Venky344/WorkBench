import { BaseEntity } from './base.entity';
import { EntityId } from '@/types';
import { ProvenanceRecord } from '../value-objects/provenance';

/**
 * Normalized web resource / external link.
 */
export interface Link extends BaseEntity {
  readonly workspaceId: EntityId;
  readonly projectId?: EntityId;
  readonly url: string;
  readonly title: string;
  readonly description?: string;
  readonly domain: string;
  readonly faviconUrl?: string;
  readonly sourceId?: EntityId;
  readonly provenance?: ProvenanceRecord;
  readonly tags: readonly string[];
}
