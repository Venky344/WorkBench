import { BaseService } from './base.service';
import {
  IChatRepository,
  IMessageRepository,
} from '@/repositories/contracts/entity-repositories.contract';
import { Chat, Message, MessageRole } from '@/domain/entities';
import { generateEntityId } from '@/domain/value-objects/id';
import { createCurrentTimestamp } from '@/domain/value-objects/timestamp';
import { validateNonEmptyString } from '@/domain/validation/entity.validator';
import { EntityId } from '@/types';
import { ProvenanceRecord } from '@/domain/value-objects/provenance';

export class ChatService extends BaseService {
  private readonly chatRepo: IChatRepository;
  private readonly messageRepo: IMessageRepository;

  constructor(chatRepo: IChatRepository, messageRepo: IMessageRepository) {
    super('ChatService');
    this.chatRepo = chatRepo;
    this.messageRepo = messageRepo;
  }

  async getChatWithMessages(
    chatId: EntityId,
  ): Promise<{ chat: Chat; messages: readonly Message[] }> {
    const chat = await this.chatRepo.getOrThrow(chatId);
    const messages = await this.messageRepo.findByChatId(chatId);
    return { chat, messages };
  }

  async createChat(params: {
    workspaceId: EntityId;
    projectId?: EntityId;
    chatGroupId?: EntityId;
    title: string;
    summary?: string;
    sourceId?: EntityId;
    provenance?: ProvenanceRecord;
    tags?: readonly string[];
  }): Promise<Chat> {
    const title = validateNonEmptyString(params.title, 'Chat title');
    const now = createCurrentTimestamp();

    const chat: Chat = {
      id: generateEntityId(),
      workspaceId: params.workspaceId,
      projectId: params.projectId,
      chatGroupId: params.chatGroupId,
      title,
      summary: params.summary,
      sourceId: params.sourceId,
      provenance: params.provenance,
      isPinned: false,
      isArchived: false,
      messageCount: 0,
      order: 0,
      tags: Object.freeze(params.tags ? [...params.tags] : []),
      createdAt: now,
      updatedAt: now,
    };

    return this.chatRepo.save(chat);
  }

  async addMessage(params: {
    chatId: EntityId;
    role: MessageRole;
    content: string;
    sourceMessageId?: string;
    authorName?: string;
    modelName?: string;
  }): Promise<Message> {
    const chat = await this.chatRepo.getOrThrow(params.chatId);
    const existingMessages = await this.messageRepo.findByChatId(params.chatId);
    const sequenceNumber = existingMessages.length + 1;
    const now = createCurrentTimestamp();

    const message: Message = {
      id: generateEntityId(),
      chatId: params.chatId,
      role: params.role,
      content: params.content,
      sequenceNumber,
      sourceMessageId: params.sourceMessageId,
      authorName: params.authorName,
      modelName: params.modelName,
      createdAt: now,
      updatedAt: now,
    };

    const savedMessage = await this.messageRepo.save(message);

    // Update messageCount and updatedAt on parent chat
    await this.chatRepo.save({
      ...chat,
      messageCount: sequenceNumber,
      updatedAt: now,
    });

    return savedMessage;
  }
}
