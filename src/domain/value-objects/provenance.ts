/**
 * Provenance value object representing the origin of imported content in WorkBench.
 */
import { ISOTimestamp } from '@/types';

export type SourceProvider =
  | 'chatgpt'
  | 'claude'
  | 'gemini'
  | 'perplexity'
  | 'web'
  | 'file'
  | 'clipboard'
  | 'manual'
  | 'browser_extension'
  | 'other';

export type ProvenanceContentType =
  'chat' | 'note' | 'code' | 'pdf' | 'html' | 'link' | 'snippet' | 'raw_text';

export interface ProvenanceRecord {
  readonly provider: SourceProvider;
  readonly sourceUrl?: string;
  readonly sourceConversationId?: string;
  readonly sourceMessageId?: string;
  readonly importedAt: ISOTimestamp;
  readonly originalTitle?: string;
  readonly externalId?: string;
  readonly contentType: ProvenanceContentType;
  readonly author?: string;
  readonly metadata?: Readonly<Record<string, string | number | boolean>>;
}
