import { BaseService } from './base.service';
import { ICodeSnippetRepository } from '@/repositories/contracts/entity-repositories.contract';
import { CodeSnippet } from '@/domain/entities';
import { generateEntityId } from '@/domain/value-objects/id';
import { createCurrentTimestamp } from '@/domain/value-objects/timestamp';
import { validateNonEmptyString } from '@/domain/validation/entity.validator';
import { EntityId } from '@/types';
import { NotFoundError, ValidationError } from '@/utils/errors';

export interface CreateCodeSnippetInput {
  readonly workspaceId: EntityId;
  readonly projectId: EntityId;
  readonly title?: string;
  readonly language: string;
  readonly code: string;
  readonly description?: string;
  readonly filename?: string;
  readonly chatId?: EntityId;
  readonly messageId?: EntityId;
  readonly tags?: readonly string[];
}

export interface UpdateCodeSnippetInput {
  readonly title?: string;
  readonly language?: string;
  readonly code?: string;
  readonly description?: string;
  readonly filename?: string;
  readonly tags?: readonly string[];
}

export class CodeSnippetService extends BaseService {
  constructor(private readonly snippetRepo: ICodeSnippetRepository) {
    super('CodeSnippetService');
  }

  async createCodeSnippet(input: CreateCodeSnippetInput): Promise<CodeSnippet> {
    const code = validateNonEmptyString(input.code, 'Snippet code');
    const language = (input.language || 'plaintext').trim().toLowerCase();
    const now = createCurrentTimestamp();

    const snippet: CodeSnippet = {
      id: generateEntityId(),
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      title: input.title?.trim() || undefined,
      language,
      code,
      description: input.description?.trim() || undefined,
      filename: input.filename?.trim() || undefined,
      chatId: input.chatId,
      messageId: input.messageId,
      tags: Object.freeze(input.tags ? [...input.tags] : []),
      createdAt: now,
      updatedAt: now,
    };

    const saved = await this.snippetRepo.save(snippet);
    this.log.info(
      `CodeSnippet created: "${saved.title || saved.filename || saved.id}" (${saved.id}) in project ${saved.projectId}`,
    );
    return saved;
  }

  async getCodeSnippet(id: EntityId): Promise<CodeSnippet | null> {
    return this.snippetRepo.findById(id);
  }

  async getCodeSnippetOrThrow(id: EntityId, expectedProjectId?: EntityId): Promise<CodeSnippet> {
    const snippet = await this.snippetRepo.findById(id);
    if (!snippet) {
      throw new NotFoundError('CodeSnippet', id);
    }
    if (expectedProjectId && snippet.projectId !== expectedProjectId) {
      throw new ValidationError(
        `CodeSnippet "${id}" belongs to project "${snippet.projectId}", not "${expectedProjectId}"`,
      );
    }
    return snippet;
  }

  async updateCodeSnippet(
    id: EntityId,
    updates: UpdateCodeSnippetInput,
    expectedProjectId?: EntityId,
  ): Promise<CodeSnippet> {
    const existing = await this.getCodeSnippetOrThrow(id, expectedProjectId);

    let updatedCode = existing.code;
    if (updates.code !== undefined) {
      updatedCode = validateNonEmptyString(updates.code, 'Snippet code');
    }

    const updated: CodeSnippet = {
      ...existing,
      code: updatedCode,
      language:
        updates.language !== undefined ? updates.language.trim().toLowerCase() : existing.language,
      title: updates.title !== undefined ? updates.title.trim() || undefined : existing.title,
      description:
        updates.description !== undefined
          ? updates.description.trim() || undefined
          : existing.description,
      filename:
        updates.filename !== undefined ? updates.filename.trim() || undefined : existing.filename,
      tags: updates.tags !== undefined ? Object.freeze([...updates.tags]) : existing.tags,
      updatedAt: createCurrentTimestamp(),
    };

    const saved = await this.snippetRepo.save(updated);
    this.log.info(`CodeSnippet updated: "${saved.title || saved.id}" (${saved.id})`);
    return saved;
  }

  async deleteCodeSnippet(id: EntityId, expectedProjectId?: EntityId): Promise<boolean> {
    const existing = await this.snippetRepo.findById(id);
    if (!existing) {
      return false;
    }

    if (expectedProjectId && existing.projectId !== expectedProjectId) {
      throw new ValidationError(
        `CodeSnippet "${id}" belongs to project "${existing.projectId}", not "${expectedProjectId}"`,
      );
    }

    await this.snippetRepo.delete(id);
    this.log.info(`CodeSnippet deleted: "${existing.title || existing.id}" (${existing.id})`);
    return true;
  }

  async listCodeSnippetsByProject(projectId: EntityId): Promise<readonly CodeSnippet[]> {
    return this.snippetRepo.findByProjectId(projectId);
  }

  async listCodeSnippetsByWorkspace(workspaceId: EntityId): Promise<readonly CodeSnippet[]> {
    return this.snippetRepo.findByWorkspaceId(workspaceId);
  }

  async listByLanguage(projectId: EntityId, language: string): Promise<readonly CodeSnippet[]> {
    const normalized = language.trim().toLowerCase();
    const snippets = await this.snippetRepo.findByProjectId(projectId);
    return snippets.filter((s) => s.language.toLowerCase() === normalized);
  }

  async listByChatId(chatId: EntityId): Promise<readonly CodeSnippet[]> {
    return this.snippetRepo.findByChatId(chatId);
  }
}
