import { BaseEntity } from './base.entity';
import { EntityId } from '@/types';
import { ProvenanceRecord } from '../value-objects/provenance';

/**
 * Isolated code snippet extracted from chats, notes, or files.
 */
export interface CodeSnippet extends BaseEntity {
  readonly workspaceId: EntityId;
  readonly projectId?: EntityId;
  readonly chatId?: EntityId;
  readonly messageId?: EntityId;
  readonly title?: string;
  readonly language: string;
  readonly code: string;
  readonly filename?: string;
  readonly sourceId?: EntityId;
  readonly provenance?: ProvenanceRecord;
  readonly tags: readonly string[];
}
