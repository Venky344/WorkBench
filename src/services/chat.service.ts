import { BaseService } from './base.service';
import {
  IChatRepository,
  IMessageRepository,
  IChatGroupRepository,
} from '@/repositories/contracts/entity-repositories.contract';
import { Chat, Message, MessageRole } from '@/domain/entities';
import { generateEntityId } from '@/domain/value-objects/id';
import { createCurrentTimestamp } from '@/domain/value-objects/timestamp';
import { validateNonEmptyString } from '@/domain/validation/entity.validator';
import { EntityId } from '@/types';
import { ProvenanceRecord } from '@/domain/value-objects/provenance';
import { NotFoundError, ValidationError } from '@/utils/errors';

export type ChatStatusFilter = 'all' | 'active' | 'pinned' | 'favorites' | 'archived';
export type ChatSortBy = 'updatedAt' | 'createdAt' | 'title';
export type SortDirection = 'asc' | 'desc';

export interface ListChatsOptions {
  readonly status?: ChatStatusFilter;
  readonly groupId?: EntityId | null;
  readonly tagId?: string;
  readonly search?: string;
  readonly sortBy?: ChatSortBy;
  readonly sortDirection?: SortDirection;
}

export class ChatService extends BaseService {
  private readonly chatRepo: IChatRepository;
  private readonly messageRepo: IMessageRepository;
  private readonly chatGroupRepo?: IChatGroupRepository;

  constructor(
    chatRepo: IChatRepository,
    messageRepo: IMessageRepository,
    chatGroupRepo?: IChatGroupRepository,
  ) {
    super('ChatService');
    this.chatRepo = chatRepo;
    this.messageRepo = messageRepo;
    this.chatGroupRepo = chatGroupRepo;
  }

  async getChat(id: EntityId): Promise<Chat | null> {
    return this.chatRepo.findById(id);
  }

  async getChatOrThrow(id: EntityId): Promise<Chat> {
    const chat = await this.chatRepo.findById(id);
    if (!chat) {
      throw new NotFoundError('Chat', id);
    }
    return chat;
  }

  async getChatWithMessages(
    chatId: EntityId,
  ): Promise<{ chat: Chat; messages: readonly Message[] }> {
    const chat = await this.getChatOrThrow(chatId);
    const messages = await this.messageRepo.findByChatId(chatId);
    return { chat, messages };
  }

  async createChat(params: {
    workspaceId: EntityId;
    projectId: EntityId;
    chatGroupId?: EntityId;
    title: string;
    description?: string;
    summary?: string;
    source?: string;
    sourceType?: string;
    sourceId?: EntityId;
    provenance?: ProvenanceRecord;
    tags?: readonly string[];
    isPinned?: boolean;
    isFavorite?: boolean;
  }): Promise<Chat> {
    const title = validateNonEmptyString(params.title, 'Chat title');
    const now = createCurrentTimestamp();

    if (params.chatGroupId && this.chatGroupRepo) {
      const group = await this.chatGroupRepo.findById(params.chatGroupId);
      if (!group) {
        throw new NotFoundError('ChatGroup', params.chatGroupId);
      }
      if (group.projectId !== params.projectId) {
        throw new ValidationError(
          `Chat group "${params.chatGroupId}" does not belong to project "${params.projectId}"`,
        );
      }
    }

    const chat: Chat = {
      id: generateEntityId(),
      workspaceId: params.workspaceId,
      projectId: params.projectId,
      chatGroupId: params.chatGroupId,
      title,
      description: params.description?.trim(),
      summary: params.summary,
      source: params.source ?? 'manual',
      sourceType: params.sourceType,
      sourceId: params.sourceId,
      provenance: params.provenance,
      isPinned: !!params.isPinned,
      isFavorite: !!params.isFavorite,
      isArchived: false,
      messageCount: 0,
      order: 0,
      tags: Object.freeze(params.tags ? [...params.tags] : []),
      lastActivityAt: now,
      createdAt: now,
      updatedAt: now,
    };

    const saved = await this.chatRepo.save(chat);
    this.log.info(`Chat created: ${saved.title} (${saved.id})`);
    return saved;
  }

  async listChats(projectId: EntityId, options: ListChatsOptions = {}): Promise<readonly Chat[]> {
    const {
      status = 'all',
      groupId,
      search,
      sortBy = 'updatedAt',
      sortDirection = 'desc',
    } = options;

    let chats = await this.chatRepo.findByProjectId(projectId);

    // Filter by status
    if (status === 'active') {
      chats = chats.filter((c) => !c.isArchived);
    } else if (status === 'pinned') {
      chats = chats.filter((c) => c.isPinned && !c.isArchived);
    } else if (status === 'favorites') {
      chats = chats.filter((c) => c.isFavorite && !c.isArchived);
    } else if (status === 'archived') {
      chats = chats.filter((c) => c.isArchived);
    }

    // Filter by group if specified
    if (groupId !== undefined) {
      if (groupId === null) {
        // Ungrouped
        chats = chats.filter((c) => !c.chatGroupId);
      } else {
        chats = chats.filter((c) => c.chatGroupId === groupId);
      }
    }

    // Filter by tag if specified
    if (options.tagId) {
      chats = chats.filter((c) => c.tags && c.tags.includes(options.tagId!));
    }

    // Basic metadata search (title / description)
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      chats = chats.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          (c.description && c.description.toLowerCase().includes(q)) ||
          c.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }

    // Sorting
    const sorted = [...chats].sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'title') {
        comparison = a.title.localeCompare(b.title);
      } else if (sortBy === 'createdAt') {
        comparison = Date.parse(a.createdAt) - Date.parse(b.createdAt);
      } else {
        // Default updatedAt
        const timeA = a.lastActivityAt ?? a.updatedAt;
        const timeB = b.lastActivityAt ?? b.updatedAt;
        comparison = Date.parse(timeA) - Date.parse(timeB);
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }

  async listWorkspaceChats(workspaceId: EntityId): Promise<readonly Chat[]> {
    const all = await this.chatRepo.findByWorkspaceId(workspaceId);
    return [...all].sort(
      (a, b) =>
        Date.parse(b.lastActivityAt ?? b.updatedAt) - Date.parse(a.lastActivityAt ?? a.updatedAt),
    );
  }

  async updateChat(
    id: EntityId,
    updates: {
      title?: string;
      description?: string;
      summary?: string;
      chatGroupId?: EntityId | null;
      tags?: readonly string[];
      source?: string;
    },
  ): Promise<Chat> {
    const chat = await this.getChatOrThrow(id);
    const now = createCurrentTimestamp();

    let title = chat.title;
    if (updates.title !== undefined) {
      title = validateNonEmptyString(updates.title, 'Chat title');
    }

    let chatGroupId = chat.chatGroupId;
    if (updates.chatGroupId !== undefined) {
      if (updates.chatGroupId === null) {
        chatGroupId = undefined;
      } else {
        if (this.chatGroupRepo) {
          const group = await this.chatGroupRepo.findById(updates.chatGroupId);
          if (!group) {
            throw new NotFoundError('ChatGroup', updates.chatGroupId);
          }
          if (chat.projectId && group.projectId !== chat.projectId) {
            throw new ValidationError(
              'Cannot assign chat to a group belonging to a different project',
            );
          }
        }
        chatGroupId = updates.chatGroupId;
      }
    }

    const updatedChat: Chat = {
      ...chat,
      title,
      description:
        updates.description !== undefined ? updates.description.trim() : chat.description,
      summary: updates.summary !== undefined ? updates.summary : chat.summary,
      chatGroupId,
      tags: updates.tags !== undefined ? Object.freeze([...updates.tags]) : chat.tags,
      source: updates.source !== undefined ? updates.source : chat.source,
      updatedAt: now,
      lastActivityAt: now,
    };

    const saved = await this.chatRepo.save(updatedChat);
    this.log.info(`Chat updated: ${saved.title} (${saved.id})`);
    return saved;
  }

  async pinChat(id: EntityId): Promise<Chat> {
    return this.setPinned(id, true);
  }

  async unpinChat(id: EntityId): Promise<Chat> {
    return this.setPinned(id, false);
  }

  async setPinned(id: EntityId, isPinned: boolean): Promise<Chat> {
    const chat = await this.getChatOrThrow(id);
    if (chat.isPinned === isPinned) return chat;

    const now = createCurrentTimestamp();
    const updated: Chat = {
      ...chat,
      isPinned,
      updatedAt: now,
      lastActivityAt: now,
    };

    const saved = await this.chatRepo.save(updated);
    this.log.info(`Chat ${isPinned ? 'pinned' : 'unpinned'}: ${saved.title} (${saved.id})`);
    return saved;
  }

  async favoriteChat(id: EntityId): Promise<Chat> {
    return this.setFavorite(id, true);
  }

  async unfavoriteChat(id: EntityId): Promise<Chat> {
    return this.setFavorite(id, false);
  }

  async setFavorite(id: EntityId, isFavorite: boolean): Promise<Chat> {
    const chat = await this.getChatOrThrow(id);
    if (chat.isFavorite === isFavorite) return chat;

    const now = createCurrentTimestamp();
    const updated: Chat = {
      ...chat,
      isFavorite,
      updatedAt: now,
      lastActivityAt: now,
    };

    const saved = await this.chatRepo.save(updated);
    this.log.info(`Chat ${isFavorite ? 'favorited' : 'unfavorited'}: ${saved.title} (${saved.id})`);
    return saved;
  }

  async archiveChat(id: EntityId): Promise<Chat> {
    const chat = await this.getChatOrThrow(id);
    if (chat.isArchived) return chat;

    const now = createCurrentTimestamp();
    const updated: Chat = {
      ...chat,
      isArchived: true,
      archivedAt: now,
      isPinned: false,
      updatedAt: now,
      lastActivityAt: now,
    };

    const saved = await this.chatRepo.save(updated);
    this.log.info(`Chat archived: ${saved.title} (${saved.id})`);
    return saved;
  }

  async restoreChat(id: EntityId): Promise<Chat> {
    const chat = await this.getChatOrThrow(id);
    if (!chat.isArchived) return chat;

    const now = createCurrentTimestamp();
    const updated: Chat = {
      ...chat,
      isArchived: false,
      archivedAt: undefined,
      updatedAt: now,
      lastActivityAt: now,
    };

    const saved = await this.chatRepo.save(updated);
    this.log.info(`Chat restored: ${saved.title} (${saved.id})`);
    return saved;
  }

  async deleteChat(id: EntityId): Promise<void> {
    const chat = await this.getChatOrThrow(id);
    await this.chatRepo.delete(id);
    this.log.info(`Chat deleted: ${chat.title} (${chat.id})`);
  }

  async moveChatToGroup(chatId: EntityId, groupId: EntityId | null | undefined): Promise<Chat> {
    return this.updateChat(chatId, { chatGroupId: groupId ?? null });
  }

  async removeChatFromGroup(chatId: EntityId): Promise<Chat> {
    return this.updateChat(chatId, { chatGroupId: null });
  }

  async duplicateChat(chatId: EntityId): Promise<Chat> {
    const original = await this.getChatOrThrow(chatId);
    const now = createCurrentTimestamp();

    const duplicate: Chat = {
      id: generateEntityId(),
      workspaceId: original.workspaceId,
      projectId: original.projectId,
      chatGroupId: original.chatGroupId,
      title: `${original.title} (Copy)`,
      description: original.description,
      summary: original.summary,
      source: original.source,
      sourceType: original.sourceType,
      sourceId: original.sourceId,
      provenance: original.provenance,
      isPinned: false,
      isFavorite: false,
      isArchived: false,
      messageCount: 0,
      order: original.order,
      tags: Object.freeze([...original.tags]),
      lastActivityAt: now,
      createdAt: now,
      updatedAt: now,
    };

    const saved = await this.chatRepo.save(duplicate);
    this.log.info(`Chat duplicated: ${original.title} -> ${saved.title} (${saved.id})`);
    return saved;
  }

  async addMessage(params: {
    chatId: EntityId;
    role: MessageRole;
    content: string;
    sourceMessageId?: string;
    authorName?: string;
    modelName?: string;
  }): Promise<Message> {
    const chat = await this.getChatOrThrow(params.chatId);
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

    await this.chatRepo.save({
      ...chat,
      messageCount: sequenceNumber,
      updatedAt: now,
      lastActivityAt: now,
    });

    return savedMessage;
  }
}
