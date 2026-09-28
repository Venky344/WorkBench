import { BaseEntity } from './base.entity';
import { EntityId } from '@/types';

export type MessageRole = 'user' | 'assistant' | 'system' | 'tool' | 'unknown';

/**
 * Normalized message belonging to a Chat conversation.
 */
export interface Message extends BaseEntity {
  readonly chatId: EntityId;
  readonly role: MessageRole;
  readonly content: string;
  readonly sequenceNumber: number;
  readonly sourceMessageId?: string;
  readonly authorName?: string;
  readonly modelName?: string;
  readonly isPinned?: boolean;
  readonly tags?: readonly string[];
}
