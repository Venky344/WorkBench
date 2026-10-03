import { BaseService } from './base.service';
import {
  ITagRepository,
  IProjectRepository,
  IChatRepository,
  IFileRepository,
  INoteRepository,
  ILinkRepository,
  IBookmarkRepository,
  IReferenceRepository,
  ICodeSnippetRepository,
} from '@/repositories/contracts/entity-repositories.contract';
import { Tag, Project, Chat } from '@/domain/entities';
import { generateEntityId } from '@/domain/value-objects/id';
import { createCurrentTimestamp } from '@/domain/value-objects/timestamp';
import { validateNonEmptyString } from '@/domain/validation/entity.validator';
import { EntityId } from '@/types';
import { NotFoundError, ValidationError, ConflictError } from '@/utils/errors';

export interface TagUsageCount {
  readonly projectCount: number;
  readonly chatCount: number;
  readonly fileCount?: number;
  readonly noteCount?: number;
  readonly linkCount?: number;
  readonly bookmarkCount?: number;
  readonly referenceCount?: number;
  readonly codeSnippetCount?: number;
  readonly totalCount: number;
}

export class TagService extends BaseService {
  constructor(
    private readonly tagRepo: ITagRepository,
    private readonly projectRepo?: IProjectRepository,
    private readonly chatRepo?: IChatRepository,
    private readonly fileRepo?: IFileRepository,
    private readonly noteRepo?: INoteRepository,
    private readonly linkRepo?: ILinkRepository,
    private readonly bookmarkRepo?: IBookmarkRepository,
    private readonly referenceRepo?: IReferenceRepository,
    private readonly snippetRepo?: ICodeSnippetRepository,
  ) {
    super('TagService');
  }

  /**
   * Normalizes a user-provided tag name for uniqueness checks.
   * Trims whitespace, removes leading '#', collapses spaces into hyphens, and converts to lowercase.
   */
  normalizeTagName(name: string): string {
    const trimmed = name.trim().replace(/^#+/, '').trim();
    return trimmed
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-_]/g, '');
  }

  async createTag(params: {
    workspaceId: EntityId;
    name: string;
    color?: string;
    description?: string;
  }): Promise<Tag> {
    const name = validateNonEmptyString(params.name, 'Tag name');
    const normalizedName = this.normalizeTagName(name);

    if (!normalizedName) {
      throw new ValidationError('Tag name must contain at least one alphanumeric character');
    }

    // Check duplicate tag within workspace
    const exists = await this.tagRepo.existsByName(params.workspaceId, normalizedName);
    if (exists) {
      throw new ConflictError(`A tag named "${name}" already exists in this workspace`);
    }

    const now = createCurrentTimestamp();
    const tag: Tag = {
      id: generateEntityId(),
      workspaceId: params.workspaceId,
      name: name.trim().replace(/^#+/, '').trim(),
      normalizedName,
      color: params.color ?? 'blue',
      description: params.description?.trim() || undefined,
      createdAt: now,
      updatedAt: now,
    };

    const saved = await this.tagRepo.save(tag);
    this.log.info(`Tag created: ${saved.name} (${saved.id}) in workspace ${saved.workspaceId}`);
    return saved;
  }

  async getTag(id: EntityId): Promise<Tag | null> {
    return this.tagRepo.findById(id);
  }

  async getTagOrThrow(id: EntityId): Promise<Tag> {
    const tag = await this.tagRepo.findById(id);
    if (!tag) {
      throw new NotFoundError('Tag', id);
    }
    return tag;
  }

  async findTag(workspaceId: EntityId, nameOrNormalized: string): Promise<Tag | null> {
    const normalized = this.normalizeTagName(nameOrNormalized);
    return this.tagRepo.findByNormalizedName(workspaceId, normalized);
  }

  async listTags(workspaceId: EntityId): Promise<readonly Tag[]> {
    return this.tagRepo.findByWorkspaceId(workspaceId);
  }

  async searchTags(workspaceId: EntityId, query: string): Promise<readonly Tag[]> {
    return this.tagRepo.searchByName(workspaceId, query);
  }

  async updateTag(
    id: EntityId,
    updates: {
      name?: string;
      color?: string;
      description?: string;
    },
  ): Promise<Tag> {
    const existing = await this.getTagOrThrow(id);

    let name = existing.name;
    let normalizedName = existing.normalizedName;

    if (updates.name !== undefined) {
      const validated = validateNonEmptyString(updates.name, 'Tag name');
      const newNormalized = this.normalizeTagName(validated);
      if (!newNormalized) {
        throw new ValidationError('Tag name must contain at least one alphanumeric character');
      }

      if (newNormalized !== existing.normalizedName) {
        const exists = await this.tagRepo.existsByName(existing.workspaceId, newNormalized, id);
        if (exists) {
          throw new ConflictError(`A tag named "${validated}" already exists in this workspace`);
        }
      }

      name = validated.trim().replace(/^#+/, '').trim();
      normalizedName = newNormalized;
    }

    const updatedTag: Tag = {
      ...existing,
      name,
      normalizedName,
      color: updates.color !== undefined ? updates.color : existing.color,
      description:
        updates.description !== undefined
          ? updates.description.trim() || undefined
          : existing.description,
      updatedAt: createCurrentTimestamp(),
    };

    const saved = await this.tagRepo.save(updatedTag);
    this.log.info(`Tag updated: ${saved.name} (${saved.id})`);
    return saved;
  }

  /**
   * Deleting a tag cleans up assignments in Projects and Chats, but does NOT delete the entities.
   */
  async deleteTag(id: EntityId): Promise<boolean> {
    const existing = await this.getTagOrThrow(id);

    // Clean up project tag assignments
    if (this.projectRepo) {
      const projects = await this.projectRepo.findByWorkspaceId(existing.workspaceId);
      for (const project of projects) {
        if (project.tags && project.tags.includes(id)) {
          const updatedProject: Project = {
            ...project,
            tags: Object.freeze(project.tags.filter((tId) => tId !== id)),
            updatedAt: createCurrentTimestamp(),
          };
          await this.projectRepo.save(updatedProject);
        }
      }
    }

    // Clean up chat tag assignments
    if (this.chatRepo) {
      const chats = await this.chatRepo.findByWorkspaceId(existing.workspaceId);
      for (const chat of chats) {
        if (chat.tags && chat.tags.includes(id)) {
          const updatedChat: Chat = {
            ...chat,
            tags: Object.freeze(chat.tags.filter((tId) => tId !== id)),
            updatedAt: createCurrentTimestamp(),
          };
          await this.chatRepo.save(updatedChat);
        }
      }
    }

    // Clean up file tag assignments
    if (this.fileRepo) {
      const files = await this.fileRepo.findByWorkspaceId(existing.workspaceId);
      for (const file of files) {
        if (file.tags && file.tags.includes(id)) {
          await this.fileRepo.save({
            ...file,
            tags: Object.freeze(file.tags.filter((tId) => tId !== id)),
            updatedAt: createCurrentTimestamp(),
          });
        }
      }
    }

    // Clean up note tag assignments
    if (this.noteRepo) {
      const notes = await this.noteRepo.findByWorkspaceId(existing.workspaceId);
      for (const note of notes) {
        if (note.tags && note.tags.includes(id)) {
          await this.noteRepo.save({
            ...note,
            tags: Object.freeze(note.tags.filter((tId) => tId !== id)),
            updatedAt: createCurrentTimestamp(),
          });
        }
      }
    }

    // Clean up link tag assignments
    if (this.linkRepo) {
      const links = await this.linkRepo.findByWorkspaceId(existing.workspaceId);
      for (const link of links) {
        if (link.tags && link.tags.includes(id)) {
          await this.linkRepo.save({
            ...link,
            tags: Object.freeze(link.tags.filter((tId) => tId !== id)),
            updatedAt: createCurrentTimestamp(),
          });
        }
      }
    }

    // Clean up bookmark tag assignments
    if (this.bookmarkRepo) {
      const bookmarks = await this.bookmarkRepo.findByWorkspaceId(existing.workspaceId);
      for (const bookmark of bookmarks) {
        if (bookmark.tags && bookmark.tags.includes(id)) {
          await this.bookmarkRepo.save({
            ...bookmark,
            tags: Object.freeze(bookmark.tags.filter((tId) => tId !== id)),
            updatedAt: createCurrentTimestamp(),
          });
        }
      }
    }

    // Clean up reference tag assignments
    if (this.referenceRepo) {
      const refs = await this.referenceRepo.findByWorkspaceId(existing.workspaceId);
      for (const ref of refs) {
        if (ref.tags && ref.tags.includes(id)) {
          await this.referenceRepo.save({
            ...ref,
            tags: Object.freeze(ref.tags.filter((tId) => tId !== id)),
            updatedAt: createCurrentTimestamp(),
          });
        }
      }
    }

    // Clean up snippet tag assignments
    if (this.snippetRepo) {
      const snippets = await this.snippetRepo.findByWorkspaceId(existing.workspaceId);
      for (const snippet of snippets) {
        if (snippet.tags && snippet.tags.includes(id)) {
          await this.snippetRepo.save({
            ...snippet,
            tags: Object.freeze(snippet.tags.filter((tId) => tId !== id)),
            updatedAt: createCurrentTimestamp(),
          });
        }
      }
    }

    const deleted = await this.tagRepo.delete(id);
    this.log.info(`Tag deleted: ${existing.name} (${existing.id}) and cleaned from assignments`);
    return deleted;
  }

  async getTagUsageCount(workspaceId: EntityId, tagId: EntityId): Promise<TagUsageCount> {
    let projectCount = 0;
    let chatCount = 0;
    let fileCount = 0;
    let noteCount = 0;
    let linkCount = 0;
    let bookmarkCount = 0;
    let referenceCount = 0;
    let codeSnippetCount = 0;

    if (this.projectRepo) {
      const projects = await this.projectRepo.findByWorkspaceId(workspaceId);
      projectCount = projects.filter((p) => p.tags && p.tags.includes(tagId)).length;
    }

    if (this.chatRepo) {
      const chats = await this.chatRepo.findByWorkspaceId(workspaceId);
      chatCount = chats.filter((c) => c.tags && c.tags.includes(tagId)).length;
    }

    if (this.fileRepo) {
      const files = await this.fileRepo.findByWorkspaceId(workspaceId);
      fileCount = files.filter((f) => f.tags && f.tags.includes(tagId)).length;
    }

    if (this.noteRepo) {
      const notes = await this.noteRepo.findByWorkspaceId(workspaceId);
      noteCount = notes.filter((n) => n.tags && n.tags.includes(tagId)).length;
    }

    if (this.linkRepo) {
      const links = await this.linkRepo.findByWorkspaceId(workspaceId);
      linkCount = links.filter((l) => l.tags && l.tags.includes(tagId)).length;
    }

    if (this.bookmarkRepo) {
      const bookmarks = await this.bookmarkRepo.findByWorkspaceId(workspaceId);
      bookmarkCount = bookmarks.filter((b) => b.tags && b.tags.includes(tagId)).length;
    }

    if (this.referenceRepo) {
      const refs = await this.referenceRepo.findByWorkspaceId(workspaceId);
      referenceCount = refs.filter((r) => r.tags && r.tags.includes(tagId)).length;
    }

    if (this.snippetRepo) {
      const snippets = await this.snippetRepo.findByWorkspaceId(workspaceId);
      codeSnippetCount = snippets.filter((s) => s.tags && s.tags.includes(tagId)).length;
    }

    return {
      projectCount,
      chatCount,
      fileCount,
      noteCount,
      linkCount,
      bookmarkCount,
      referenceCount,
      codeSnippetCount,
      totalCount:
        projectCount +
        chatCount +
        fileCount +
        noteCount +
        linkCount +
        bookmarkCount +
        referenceCount +
        codeSnippetCount,
    };
  }

  // ==========================================
  // Project Tag Assignment
  // ==========================================

  async addTagToProject(projectId: EntityId, tagId: EntityId): Promise<Project> {
    if (!this.projectRepo) {
      throw new Error('Project repository not available');
    }
    const project = await this.projectRepo.findById(projectId);
    if (!project) {
      throw new NotFoundError('Project', projectId);
    }
    const tag = await this.getTagOrThrow(tagId);
    if (tag.workspaceId !== project.workspaceId) {
      throw new ValidationError('Tag and Project belong to different workspaces');
    }

    if (project.tags && project.tags.includes(tagId)) {
      return project; // already tagged
    }

    const currentTags = project.tags ? [...project.tags] : [];
    currentTags.push(tagId);

    const updated: Project = {
      ...project,
      tags: Object.freeze(currentTags),
      updatedAt: createCurrentTimestamp(),
    };

    return this.projectRepo.save(updated);
  }

  async removeTagFromProject(projectId: EntityId, tagId: EntityId): Promise<Project> {
    if (!this.projectRepo) {
      throw new Error('Project repository not available');
    }
    const project = await this.projectRepo.findById(projectId);
    if (!project) {
      throw new NotFoundError('Project', projectId);
    }

    const updatedTags = (project.tags ?? []).filter((tId) => tId !== tagId);
    const updated: Project = {
      ...project,
      tags: Object.freeze(updatedTags),
      updatedAt: createCurrentTimestamp(),
    };

    return this.projectRepo.save(updated);
  }

  async setProjectTags(projectId: EntityId, tagIds: readonly EntityId[]): Promise<Project> {
    if (!this.projectRepo) {
      throw new Error('Project repository not available');
    }
    const project = await this.projectRepo.findById(projectId);
    if (!project) {
      throw new NotFoundError('Project', projectId);
    }

    // Validate all tags exist in the same workspace
    for (const tagId of tagIds) {
      const tag = await this.getTagOrThrow(tagId);
      if (tag.workspaceId !== project.workspaceId) {
        throw new ValidationError(`Tag "${tag.name}" belongs to a different workspace`);
      }
    }

    // Deduplicate
    const uniqueTagIds = Array.from(new Set(tagIds));

    const updated: Project = {
      ...project,
      tags: Object.freeze(uniqueTagIds),
      updatedAt: createCurrentTimestamp(),
    };

    return this.projectRepo.save(updated);
  }

  async getProjectTags(projectId: EntityId): Promise<readonly Tag[]> {
    if (!this.projectRepo) {
      throw new Error('Project repository not available');
    }
    const project = await this.projectRepo.findById(projectId);
    if (!project) {
      throw new NotFoundError('Project', projectId);
    }

    if (!project.tags || project.tags.length === 0) {
      return [];
    }

    const tags: Tag[] = [];
    for (const tagId of project.tags) {
      const tag = await this.tagRepo.findById(tagId);
      if (tag) {
        tags.push(tag);
      }
    }
    return tags;
  }

  // ==========================================
  // Chat Tag Assignment
  // ==========================================

  async addTagToChat(chatId: EntityId, tagId: EntityId): Promise<Chat> {
    if (!this.chatRepo) {
      throw new Error('Chat repository not available');
    }
    const chat = await this.chatRepo.findById(chatId);
    if (!chat) {
      throw new NotFoundError('Chat', chatId);
    }
    const tag = await this.getTagOrThrow(tagId);
    if (tag.workspaceId !== chat.workspaceId) {
      throw new ValidationError('Tag and Chat belong to different workspaces');
    }

    if (chat.tags && chat.tags.includes(tagId)) {
      return chat;
    }

    const currentTags = chat.tags ? [...chat.tags] : [];
    currentTags.push(tagId);

    const updated: Chat = {
      ...chat,
      tags: Object.freeze(currentTags),
      updatedAt: createCurrentTimestamp(),
    };

    return this.chatRepo.save(updated);
  }

  async removeTagFromChat(chatId: EntityId, tagId: EntityId): Promise<Chat> {
    if (!this.chatRepo) {
      throw new Error('Chat repository not available');
    }
    const chat = await this.chatRepo.findById(chatId);
    if (!chat) {
      throw new NotFoundError('Chat', chatId);
    }

    const updatedTags = (chat.tags ?? []).filter((tId) => tId !== tagId);
    const updated: Chat = {
      ...chat,
      tags: Object.freeze(updatedTags),
      updatedAt: createCurrentTimestamp(),
    };

    return this.chatRepo.save(updated);
  }

  async setChatTags(chatId: EntityId, tagIds: readonly EntityId[]): Promise<Chat> {
    if (!this.chatRepo) {
      throw new Error('Chat repository not available');
    }
    const chat = await this.chatRepo.findById(chatId);
    if (!chat) {
      throw new NotFoundError('Chat', chatId);
    }

    for (const tagId of tagIds) {
      const tag = await this.getTagOrThrow(tagId);
      if (tag.workspaceId !== chat.workspaceId) {
        throw new ValidationError(`Tag "${tag.name}" belongs to a different workspace`);
      }
    }

    const uniqueTagIds = Array.from(new Set(tagIds));

    const updated: Chat = {
      ...chat,
      tags: Object.freeze(uniqueTagIds),
      updatedAt: createCurrentTimestamp(),
    };

    return this.chatRepo.save(updated);
  }

  async getChatTags(chatId: EntityId): Promise<readonly Tag[]> {
    if (!this.chatRepo) {
      throw new Error('Chat repository not available');
    }
    const chat = await this.chatRepo.findById(chatId);
    if (!chat) {
      throw new NotFoundError('Chat', chatId);
    }

    if (!chat.tags || chat.tags.length === 0) {
      return [];
    }

    const tags: Tag[] = [];
    for (const tagId of chat.tags) {
      const tag = await this.tagRepo.findById(tagId);
      if (tag) {
        tags.push(tag);
      }
    }
    return tags;
  }
}
