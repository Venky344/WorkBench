import { BaseService } from './base.service';
import {
  IChatGroupRepository,
  IChatRepository,
  IProjectRepository,
} from '@/repositories/contracts/entity-repositories.contract';
import { ChatGroup } from '@/domain/entities';
import { generateEntityId } from '@/domain/value-objects/id';
import { createCurrentTimestamp } from '@/domain/value-objects/timestamp';
import { validateNonEmptyString } from '@/domain/validation/entity.validator';
import { EntityId } from '@/types';
import { NotFoundError, ConflictError, ValidationError } from '@/utils/errors';

export class ChatGroupService extends BaseService {
  private readonly groupRepo: IChatGroupRepository;
  private readonly chatRepo: IChatRepository;
  private readonly projectRepo?: IProjectRepository;

  constructor(
    groupRepo: IChatGroupRepository,
    chatRepo: IChatRepository,
    projectRepo?: IProjectRepository,
  ) {
    super('ChatGroupService');
    this.groupRepo = groupRepo;
    this.chatRepo = chatRepo;
    this.projectRepo = projectRepo;
  }

  async getGroup(id: EntityId): Promise<ChatGroup | null> {
    return this.groupRepo.findById(id);
  }

  async getGroupOrThrow(id: EntityId): Promise<ChatGroup> {
    const group = await this.groupRepo.findById(id);
    if (!group) {
      throw new NotFoundError('ChatGroup', id);
    }
    return group;
  }

  async listGroups(projectId: EntityId): Promise<readonly ChatGroup[]> {
    const groups = await this.groupRepo.findByProjectId(projectId);
    return [...groups].sort((a, b) => {
      // Pinned groups first, then by order, then by creation date
      if (a.isPinned !== b.isPinned) {
        return a.isPinned ? -1 : 1;
      }
      if (a.order !== b.order) {
        return a.order - b.order;
      }
      return Date.parse(a.createdAt) - Date.parse(b.createdAt);
    });
  }

  async createGroup(params: {
    workspaceId: EntityId;
    projectId: EntityId;
    name: string;
    description?: string;
    color?: string;
    icon?: string;
    order?: number;
  }): Promise<ChatGroup> {
    const name = validateNonEmptyString(params.name, 'Group name');

    // Validate project exists if projectRepo available
    if (this.projectRepo) {
      const project = await this.projectRepo.findById(params.projectId);
      if (!project) {
        throw new NotFoundError('Project', params.projectId);
      }
      if (project.workspaceId !== params.workspaceId) {
        throw new ValidationError('Project does not belong to specified workspace');
      }
    }

    // Check duplicate group name within project
    const exists = await this.groupRepo.existsByName(params.projectId, name);
    if (exists) {
      throw new ConflictError(`A chat group named "${name}" already exists in this project`);
    }

    const now = createCurrentTimestamp();
    const group: ChatGroup = {
      id: generateEntityId(),
      workspaceId: params.workspaceId,
      projectId: params.projectId,
      name,
      description: params.description?.trim(),
      color: params.color,
      icon: params.icon,
      order: params.order ?? 0,
      isPinned: false,
      isCollapsed: false,
      createdAt: now,
      updatedAt: now,
    };

    const saved = await this.groupRepo.save(group);
    this.log.info(`ChatGroup created: ${saved.name} (${saved.id}) in project ${saved.projectId}`);
    return saved;
  }

  async updateGroup(
    id: EntityId,
    updates: {
      name?: string;
      description?: string;
      color?: string;
      icon?: string;
      order?: number;
      isCollapsed?: boolean;
    },
  ): Promise<ChatGroup> {
    const group = await this.getGroupOrThrow(id);
    const now = createCurrentTimestamp();

    let name = group.name;
    if (updates.name !== undefined) {
      name = validateNonEmptyString(updates.name, 'Group name');
      if (name.toLowerCase() !== group.name.toLowerCase()) {
        const exists = await this.groupRepo.existsByName(group.projectId, name, group.id);
        if (exists) {
          throw new ConflictError(`A chat group named "${name}" already exists in this project`);
        }
      }
    }

    const updated: ChatGroup = {
      ...group,
      name,
      description:
        updates.description !== undefined ? updates.description.trim() : group.description,
      color: updates.color !== undefined ? updates.color : group.color,
      icon: updates.icon !== undefined ? updates.icon : group.icon,
      order: updates.order !== undefined ? updates.order : group.order,
      isCollapsed: updates.isCollapsed !== undefined ? updates.isCollapsed : group.isCollapsed,
      updatedAt: now,
    };

    const saved = await this.groupRepo.save(updated);
    this.log.info(`ChatGroup updated: ${saved.name} (${saved.id})`);
    return saved;
  }

  async pinGroup(id: EntityId): Promise<ChatGroup> {
    const group = await this.getGroupOrThrow(id);
    if (group.isPinned) return group;

    const now = createCurrentTimestamp();
    const updated: ChatGroup = {
      ...group,
      isPinned: true,
      updatedAt: now,
    };

    const saved = await this.groupRepo.save(updated);
    this.log.info(`ChatGroup pinned: ${saved.name} (${saved.id})`);
    return saved;
  }

  async unpinGroup(id: EntityId): Promise<ChatGroup> {
    const group = await this.getGroupOrThrow(id);
    if (!group.isPinned) return group;

    const now = createCurrentTimestamp();
    const updated: ChatGroup = {
      ...group,
      isPinned: false,
      updatedAt: now,
    };

    const saved = await this.groupRepo.save(updated);
    this.log.info(`ChatGroup unpinned: ${saved.name} (${saved.id})`);
    return saved;
  }

  async toggleGroupCollapse(id: EntityId): Promise<ChatGroup> {
    const group = await this.getGroupOrThrow(id);
    const now = createCurrentTimestamp();
    const updated: ChatGroup = {
      ...group,
      isCollapsed: !group.isCollapsed,
      updatedAt: now,
    };

    return this.groupRepo.save(updated);
  }

  /**
   * Deleting a ChatGroup MUST NOT delete the chats inside it.
   * Instead, all chats belonging to this group are ungrouped (chatGroupId = undefined).
   */
  async deleteGroup(id: EntityId): Promise<void> {
    const group = await this.getGroupOrThrow(id);

    // Ungroup all associated chats
    const groupChats = await this.chatRepo.findByChatGroupId(id);
    const now = createCurrentTimestamp();

    for (const chat of groupChats) {
      await this.chatRepo.save({
        ...chat,
        chatGroupId: undefined,
        updatedAt: now,
        lastActivityAt: now,
      });
    }

    await this.groupRepo.delete(id);
    this.log.info(
      `ChatGroup deleted: ${group.name} (${group.id}), ${groupChats.length} chats ungrouped`,
    );
  }
}
