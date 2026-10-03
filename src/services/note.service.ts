import { BaseService } from './base.service';
import { INoteRepository } from '@/repositories/contracts/entity-repositories.contract';
import { Note } from '@/domain/entities';
import { generateEntityId } from '@/domain/value-objects/id';
import { createCurrentTimestamp } from '@/domain/value-objects/timestamp';
import { validateNonEmptyString } from '@/domain/validation/entity.validator';
import { EntityId } from '@/types';
import { NotFoundError, ValidationError } from '@/utils/errors';

export interface CreateNoteInput {
  readonly workspaceId: EntityId;
  readonly projectId: EntityId;
  readonly title: string;
  readonly content: string;
  readonly tags?: readonly string[];
  readonly isPinned?: boolean;
}

export interface UpdateNoteInput {
  readonly title?: string;
  readonly content?: string;
  readonly tags?: readonly string[];
  readonly isPinned?: boolean;
  readonly isArchived?: boolean;
}

export class NoteService extends BaseService {
  constructor(private readonly noteRepo: INoteRepository) {
    super('NoteService');
  }

  async createNote(input: CreateNoteInput): Promise<Note> {
    const title = validateNonEmptyString(input.title, 'Note title');
    const now = createCurrentTimestamp();

    const note: Note = {
      id: generateEntityId(),
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      title: title.trim(),
      content: input.content ?? '',
      isPinned: input.isPinned ?? false,
      isArchived: false,
      tags: Object.freeze(input.tags ? [...input.tags] : []),
      createdAt: now,
      updatedAt: now,
    };

    const saved = await this.noteRepo.save(note);
    this.log.info(`Note created: "${saved.title}" (${saved.id}) in project ${saved.projectId}`);
    return saved;
  }

  async getNote(id: EntityId): Promise<Note | null> {
    return this.noteRepo.findById(id);
  }

  async getNoteOrThrow(id: EntityId, expectedProjectId?: EntityId): Promise<Note> {
    const note = await this.noteRepo.findById(id);
    if (!note) {
      throw new NotFoundError('Note', id);
    }
    if (expectedProjectId && note.projectId !== expectedProjectId) {
      throw new ValidationError(
        `Note "${id}" belongs to project "${note.projectId}", not "${expectedProjectId}"`,
      );
    }
    return note;
  }

  async updateNote(
    id: EntityId,
    updates: UpdateNoteInput,
    expectedProjectId?: EntityId,
  ): Promise<Note> {
    const existing = await this.getNoteOrThrow(id, expectedProjectId);

    let updatedTitle = existing.title;
    if (updates.title !== undefined) {
      updatedTitle = validateNonEmptyString(updates.title, 'Note title').trim();
    }

    const now = createCurrentTimestamp();
    const updated: Note = {
      ...existing,
      title: updatedTitle,
      content: updates.content !== undefined ? updates.content : existing.content,
      tags: updates.tags !== undefined ? Object.freeze([...updates.tags]) : existing.tags,
      isPinned: updates.isPinned !== undefined ? updates.isPinned : existing.isPinned,
      isArchived: updates.isArchived !== undefined ? updates.isArchived : existing.isArchived,
      archivedAt:
        updates.isArchived === true
          ? (existing.archivedAt ?? now)
          : updates.isArchived === false
            ? undefined
            : existing.archivedAt,
      updatedAt: now,
    };

    const saved = await this.noteRepo.save(updated);
    this.log.info(`Note updated: "${saved.title}" (${saved.id})`);
    return saved;
  }

  async deleteNote(id: EntityId, expectedProjectId?: EntityId): Promise<boolean> {
    const existing = await this.noteRepo.findById(id);
    if (!existing) {
      return false;
    }

    if (expectedProjectId && existing.projectId !== expectedProjectId) {
      throw new ValidationError(
        `Note "${id}" belongs to project "${existing.projectId}", not "${expectedProjectId}"`,
      );
    }

    await this.noteRepo.delete(id);
    this.log.info(`Note deleted: "${existing.title}" (${existing.id})`);
    return true;
  }

  async togglePin(id: EntityId, expectedProjectId?: EntityId): Promise<Note> {
    const existing = await this.getNoteOrThrow(id, expectedProjectId);
    return this.updateNote(
      id,
      {
        isPinned: !existing.isPinned,
      },
      expectedProjectId,
    );
  }

  async listNotesByProject(projectId: EntityId): Promise<readonly Note[]> {
    return this.noteRepo.findByProjectId(projectId);
  }

  async listNotesByWorkspace(workspaceId: EntityId): Promise<readonly Note[]> {
    return this.noteRepo.findByWorkspaceId(workspaceId);
  }

  async listPinnedNotes(projectId: EntityId): Promise<readonly Note[]> {
    return this.noteRepo.findPinned(projectId);
  }
}
