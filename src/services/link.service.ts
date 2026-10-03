import { BaseService } from './base.service';
import { ILinkRepository } from '@/repositories/contracts/entity-repositories.contract';
import { Link } from '@/domain/entities';
import { generateEntityId } from '@/domain/value-objects/id';
import { createCurrentTimestamp } from '@/domain/value-objects/timestamp';
import { validateNonEmptyString } from '@/domain/validation/entity.validator';
import { EntityId } from '@/types';
import { NotFoundError, ValidationError } from '@/utils/errors';

export interface CreateLinkInput {
  readonly workspaceId: EntityId;
  readonly projectId: EntityId;
  readonly url: string;
  readonly title?: string;
  readonly description?: string;
  readonly tags?: readonly string[];
}

export interface UpdateLinkInput {
  readonly url?: string;
  readonly title?: string;
  readonly description?: string;
  readonly tags?: readonly string[];
}

export class LinkService extends BaseService {
  constructor(private readonly linkRepo: ILinkRepository) {
    super('LinkService');
  }

  /**
   * Validates URL string and extracts hostname domain.
   * Only http: and https: protocols are permitted for security.
   */
  static validateAndParseUrl(rawUrl: string): { normalizedUrl: string; domain: string } {
    const trimmed = validateNonEmptyString(rawUrl, 'URL').trim();

    let parsed: URL;
    try {
      parsed = new URL(trimmed);
    } catch {
      throw new ValidationError(`Invalid URL format: "${trimmed}"`);
    }

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new ValidationError(
        `Unsupported URL protocol "${parsed.protocol}". Only "http:" and "https:" are allowed.`,
      );
    }

    return {
      normalizedUrl: parsed.toString(),
      domain: parsed.hostname.toLowerCase(),
    };
  }

  async createLink(input: CreateLinkInput): Promise<Link> {
    const { normalizedUrl, domain } = LinkService.validateAndParseUrl(input.url);
    const title = input.title?.trim() || domain;
    const now = createCurrentTimestamp();

    const link: Link = {
      id: generateEntityId(),
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      url: normalizedUrl,
      title,
      description: input.description?.trim() || undefined,
      domain,
      tags: Object.freeze(input.tags ? [...input.tags] : []),
      createdAt: now,
      updatedAt: now,
    };

    const saved = await this.linkRepo.save(link);
    this.log.info(`Link created: "${saved.title}" (${saved.id}) in project ${saved.projectId}`);
    return saved;
  }

  async getLink(id: EntityId): Promise<Link | null> {
    return this.linkRepo.findById(id);
  }

  async getLinkOrThrow(id: EntityId, expectedProjectId?: EntityId): Promise<Link> {
    const link = await this.linkRepo.findById(id);
    if (!link) {
      throw new NotFoundError('Link', id);
    }
    if (expectedProjectId && link.projectId !== expectedProjectId) {
      throw new ValidationError(
        `Link "${id}" belongs to project "${link.projectId}", not "${expectedProjectId}"`,
      );
    }
    return link;
  }

  async updateLink(
    id: EntityId,
    updates: UpdateLinkInput,
    expectedProjectId?: EntityId,
  ): Promise<Link> {
    const existing = await this.getLinkOrThrow(id, expectedProjectId);

    let updatedUrl = existing.url;
    let updatedDomain = existing.domain;

    if (updates.url !== undefined) {
      const parsed = LinkService.validateAndParseUrl(updates.url);
      updatedUrl = parsed.normalizedUrl;
      updatedDomain = parsed.domain;
    }

    let updatedTitle = existing.title;
    if (updates.title !== undefined) {
      updatedTitle = validateNonEmptyString(updates.title, 'Link title').trim();
    }

    const updated: Link = {
      ...existing,
      url: updatedUrl,
      domain: updatedDomain,
      title: updatedTitle,
      description:
        updates.description !== undefined
          ? updates.description.trim() || undefined
          : existing.description,
      tags: updates.tags !== undefined ? Object.freeze([...updates.tags]) : existing.tags,
      updatedAt: createCurrentTimestamp(),
    };

    const saved = await this.linkRepo.save(updated);
    this.log.info(`Link updated: "${saved.title}" (${saved.id})`);
    return saved;
  }

  async deleteLink(id: EntityId, expectedProjectId?: EntityId): Promise<boolean> {
    const existing = await this.linkRepo.findById(id);
    if (!existing) {
      return false;
    }

    if (expectedProjectId && existing.projectId !== expectedProjectId) {
      throw new ValidationError(
        `Link "${id}" belongs to project "${existing.projectId}", not "${expectedProjectId}"`,
      );
    }

    await this.linkRepo.delete(id);
    this.log.info(`Link deleted: "${existing.title}" (${existing.id})`);
    return true;
  }

  async listLinksByProject(projectId: EntityId): Promise<readonly Link[]> {
    return this.linkRepo.findByProjectId(projectId);
  }

  async listLinksByWorkspace(workspaceId: EntityId): Promise<readonly Link[]> {
    return this.linkRepo.findByWorkspaceId(workspaceId);
  }

  async listLinksByDomain(domain: string): Promise<readonly Link[]> {
    return this.linkRepo.findByDomain(domain.toLowerCase().trim());
  }
}
