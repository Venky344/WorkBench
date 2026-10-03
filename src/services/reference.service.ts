import { BaseService } from './base.service';
import { IReferenceRepository } from '@/repositories/contracts/entity-repositories.contract';
import { Reference, ReferenceKind, EntityType } from '@/domain/entities';
import { generateEntityId } from '@/domain/value-objects/id';
import { createCurrentTimestamp } from '@/domain/value-objects/timestamp';
import { validateNonEmptyString } from '@/domain/validation/entity.validator';
import { EntityId } from '@/types';
import { NotFoundError, ValidationError } from '@/utils/errors';

export interface CreateReferenceInput {
  readonly workspaceId: EntityId;
  readonly projectId: EntityId;
  readonly title: string;
  readonly referenceKind: ReferenceKind;
  readonly targetUri: string;
  readonly sourceEntityType?: EntityType;
  readonly sourceEntityId?: EntityId;
  readonly annotation?: string;
  readonly tags?: readonly string[];
}

export interface UpdateReferenceInput {
  readonly title?: string;
  readonly referenceKind?: ReferenceKind;
  readonly targetUri?: string;
  readonly sourceEntityType?: EntityType;
  readonly sourceEntityId?: EntityId;
  readonly annotation?: string;
  readonly tags?: readonly string[];
}

export class ReferenceService extends BaseService {
  constructor(private readonly referenceRepo: IReferenceRepository) {
    super('ReferenceService');
  }

  async createReference(input: CreateReferenceInput): Promise<Reference> {
    const title = validateNonEmptyString(input.title, 'Reference title');
    const targetUri = validateNonEmptyString(input.targetUri, 'Target URI');
    const now = createCurrentTimestamp();

    const reference: Reference = {
      id: generateEntityId(),
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      title: title.trim(),
      referenceKind: input.referenceKind,
      targetUri: targetUri.trim(),
      sourceEntityType: input.sourceEntityType ?? 'project',
      sourceEntityId: input.sourceEntityId ?? input.projectId,
      annotation: input.annotation?.trim() || undefined,
      tags: Object.freeze(input.tags ? [...input.tags] : []),
      createdAt: now,
      updatedAt: now,
    };

    const saved = await this.referenceRepo.save(reference);
    this.log.info(
      `Reference created: "${saved.title}" (${saved.id}) [${saved.referenceKind}] in project ${saved.projectId}`,
    );
    return saved;
  }

  async getReference(id: EntityId): Promise<Reference | null> {
    return this.referenceRepo.findById(id);
  }

  async getReferenceOrThrow(id: EntityId, expectedProjectId?: EntityId): Promise<Reference> {
    const reference = await this.referenceRepo.findById(id);
    if (!reference) {
      throw new NotFoundError('Reference', id);
    }
    if (expectedProjectId && reference.projectId !== expectedProjectId) {
      throw new ValidationError(
        `Reference "${id}" belongs to project "${reference.projectId}", not "${expectedProjectId}"`,
      );
    }
    return reference;
  }

  async updateReference(
    id: EntityId,
    updates: UpdateReferenceInput,
    expectedProjectId?: EntityId,
  ): Promise<Reference> {
    const existing = await this.getReferenceOrThrow(id, expectedProjectId);

    let updatedTitle = existing.title;
    if (updates.title !== undefined) {
      updatedTitle = validateNonEmptyString(updates.title, 'Reference title').trim();
    }

    let updatedTargetUri = existing.targetUri;
    if (updates.targetUri !== undefined) {
      updatedTargetUri = validateNonEmptyString(updates.targetUri, 'Target URI').trim();
    }

    const updated: Reference = {
      ...existing,
      title: updatedTitle,
      targetUri: updatedTargetUri,
      referenceKind: updates.referenceKind ?? existing.referenceKind,
      sourceEntityType: updates.sourceEntityType ?? existing.sourceEntityType,
      sourceEntityId: updates.sourceEntityId ?? existing.sourceEntityId,
      annotation:
        updates.annotation !== undefined
          ? updates.annotation.trim() || undefined
          : existing.annotation,
      tags: updates.tags !== undefined ? Object.freeze([...updates.tags]) : existing.tags,
      updatedAt: createCurrentTimestamp(),
    };

    const saved = await this.referenceRepo.save(updated);
    this.log.info(`Reference updated: "${saved.title}" (${saved.id})`);
    return saved;
  }

  async deleteReference(id: EntityId, expectedProjectId?: EntityId): Promise<boolean> {
    const existing = await this.referenceRepo.findById(id);
    if (!existing) {
      return false;
    }

    if (expectedProjectId && existing.projectId !== expectedProjectId) {
      throw new ValidationError(
        `Reference "${id}" belongs to project "${existing.projectId}", not "${expectedProjectId}"`,
      );
    }

    await this.referenceRepo.delete(id);
    this.log.info(`Reference deleted: "${existing.title}" (${existing.id})`);
    return true;
  }

  async listReferencesByProject(projectId: EntityId): Promise<readonly Reference[]> {
    return this.referenceRepo.findByProjectId(projectId);
  }

  async listReferencesByWorkspace(workspaceId: EntityId): Promise<readonly Reference[]> {
    return this.referenceRepo.findByWorkspaceId(workspaceId);
  }

  async listReferencesBySource(
    sourceEntityType: EntityType,
    sourceEntityId: EntityId,
  ): Promise<readonly Reference[]> {
    return this.referenceRepo.findBySourceEntity(sourceEntityType, sourceEntityId);
  }
}
