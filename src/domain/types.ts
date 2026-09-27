import { EntityId, ISOTimestamp } from '@/types';

/**
 * Base contract for all persistent WorkBench entities
 */
export interface BaseEntity {
  readonly id: EntityId;
  readonly createdAt: ISOTimestamp;
  readonly updatedAt: ISOTimestamp;
}

/**
 * Provenance metadata tracking the origin of any imported artifact
 */
export interface ProvenanceRecord {
  readonly provider: 'chatgpt' | 'claude' | 'gemini' | 'perplexity' | 'web' | 'file' | 'manual';
  readonly sourceUrl?: string;
  readonly sourceConversationId?: string;
  readonly sourceMessageId?: string;
  readonly importedAt: ISOTimestamp;
  readonly originalTitle?: string;
  readonly externalId?: string;
  readonly contentType: 'chat' | 'note' | 'code' | 'pdf' | 'html' | 'link';
}

/**
 * Domain entity contract stubs establishing boundaries for future phases
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
