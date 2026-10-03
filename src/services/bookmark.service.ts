import { BaseService } from './base.service';
import { IBookmarkRepository } from '@/repositories/contracts/entity-repositories.contract';
import { Bookmark, EntityType } from '@/domain/entities';
import { generateEntityId } from '@/domain/value-objects/id';
import { createCurrentTimestamp } from '@/domain/value-objects/timestamp';
import { validateNonEmptyString } from '@/domain/validation/entity.validator';
import { EntityId } from '@/types';
import { NotFoundError, ValidationError } from '@/utils/errors';

export interface CreateBookmarkInput {
  readonly workspaceId: EntityId;
  readonly projectId: EntityId;
  readonly title: string;
  readonly targetEntityType: EntityType;
  readonly targetEntityId: EntityId;
  readonly targetUrl?: string;
  readonly note?: string;
  readonly order?: number;
  readonly tags?: readonly string[];
}

export interface UpdateBookmarkInput {
  readonly title?: string;
  readonly targetEntityType?: EntityType;
  readonly targetEntityId?: EntityId;
  readonly targetUrl?: string;
  readonly note?: string;
  readonly order?: number;
  readonly tags?: readonly string[];
}

export class BookmarkService extends BaseService {
  constructor(private readonly bookmarkRepo: IBookmarkRepository) {
    super('BookmarkService');
  }

  async createBookmark(input: CreateBookmarkInput): Promise<Bookmark> {
    const title = validateNonEmptyString(input.title, 'Bookmark title');
    const now = createCurrentTimestamp();

    const bookmark: Bookmark = {
      id: generateEntityId(),
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      title: title.trim(),
      targetEntityType: input.targetEntityType,
      targetEntityId: input.targetEntityId,
      targetUrl: input.targetUrl?.trim() || undefined,
      note: input.note?.trim() || undefined,
      order: input.order ?? 0,
      tags: Object.freeze(input.tags ? [...input.tags] : []),
      createdAt: now,
      updatedAt: now,
    };

    const saved = await this.bookmarkRepo.save(bookmark);
    this.log.info(
      `Bookmark created: "${saved.title}" (${saved.id}) pointing to ${saved.targetEntityType}:${saved.targetEntityId}`,
    );
    return saved;
  }

  async getBookmark(id: EntityId): Promise<Bookmark | null> {
    return this.bookmarkRepo.findById(id);
  }

  async getBookmarkOrThrow(id: EntityId, expectedProjectId?: EntityId): Promise<Bookmark> {
    const bookmark = await this.bookmarkRepo.findById(id);
    if (!bookmark) {
      throw new NotFoundError('Bookmark', id);
    }
    if (expectedProjectId && bookmark.projectId !== expectedProjectId) {
      throw new ValidationError(
        `Bookmark "${id}" belongs to project "${bookmark.projectId}", not "${expectedProjectId}"`,
      );
    }
    return bookmark;
  }

  async updateBookmark(
    id: EntityId,
    updates: UpdateBookmarkInput,
    expectedProjectId?: EntityId,
  ): Promise<Bookmark> {
    const existing = await this.getBookmarkOrThrow(id, expectedProjectId);

    let updatedTitle = existing.title;
    if (updates.title !== undefined) {
      updatedTitle = validateNonEmptyString(updates.title, 'Bookmark title').trim();
    }

    const updated: Bookmark = {
      ...existing,
      title: updatedTitle,
      targetEntityType: updates.targetEntityType ?? existing.targetEntityType,
      targetEntityId: updates.targetEntityId ?? existing.targetEntityId,
      targetUrl:
        updates.targetUrl !== undefined
          ? updates.targetUrl.trim() || undefined
          : existing.targetUrl,
      note: updates.note !== undefined ? updates.note.trim() || undefined : existing.note,
      order: updates.order !== undefined ? updates.order : existing.order,
      tags: updates.tags !== undefined ? Object.freeze([...updates.tags]) : existing.tags,
      updatedAt: createCurrentTimestamp(),
    };

    const saved = await this.bookmarkRepo.save(updated);
    this.log.info(`Bookmark updated: "${saved.title}" (${saved.id})`);
    return saved;
  }

  async deleteBookmark(id: EntityId, expectedProjectId?: EntityId): Promise<boolean> {
    const existing = await this.bookmarkRepo.findById(id);
    if (!existing) {
      return false;
    }

    if (expectedProjectId && existing.projectId !== expectedProjectId) {
      throw new ValidationError(
        `Bookmark "${id}" belongs to project "${existing.projectId}", not "${expectedProjectId}"`,
      );
    }

    await this.bookmarkRepo.delete(id);
    this.log.info(`Bookmark deleted: "${existing.title}" (${existing.id})`);
    return true;
  }

  async listBookmarksByProject(projectId: EntityId): Promise<readonly Bookmark[]> {
    const bookmarks = await this.bookmarkRepo.findByProjectId(projectId);
    return [...bookmarks].sort((a, b) => a.order - b.order);
  }

  async listBookmarksByWorkspace(workspaceId: EntityId): Promise<readonly Bookmark[]> {
    const bookmarks = await this.bookmarkRepo.findByWorkspaceId(workspaceId);
    return [...bookmarks].sort((a, b) => a.order - b.order);
  }

  async findByTarget(
    targetEntityType: EntityType,
    targetEntityId: EntityId,
  ): Promise<readonly Bookmark[]> {
    return this.bookmarkRepo.findByTarget(targetEntityType, targetEntityId);
  }
}
