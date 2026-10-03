import { BaseService } from './base.service';
import { IDecisionRepository } from '@/repositories/contracts/entity-repositories.contract';
import { Decision, DecisionStatus } from '@/domain/entities';
import { generateEntityId } from '@/domain/value-objects/id';
import { createCurrentTimestamp } from '@/domain/value-objects/timestamp';
import { validateNonEmptyString } from '@/domain/validation/entity.validator';
import { EntityId } from '@/types';
import { NotFoundError, ValidationError } from '@/utils/errors';

export interface DecisionFilterOptions {
  readonly status?: DecisionStatus;
  readonly tagId?: EntityId;
}

export class DecisionService extends BaseService {
  private readonly decisionRepo: IDecisionRepository;

  constructor(decisionRepo: IDecisionRepository) {
    super('DecisionService');
    this.decisionRepo = decisionRepo;
  }

  async createDecision(params: {
    workspaceId: EntityId;
    projectId: EntityId;
    title: string;
    decision: string;
    rationale: string;
    implications?: string;
    status?: DecisionStatus;
    sourceChatId?: EntityId;
    sourceMessageId?: EntityId;
    tags?: readonly string[];
  }): Promise<Decision> {
    const title = validateNonEmptyString(params.title, 'Decision title');
    const decisionText = validateNonEmptyString(params.decision, 'Decision text');
    const rationale = validateNonEmptyString(params.rationale, 'Decision rationale');
    const now = createCurrentTimestamp();

    const record: Decision = {
      id: generateEntityId(),
      workspaceId: params.workspaceId,
      projectId: params.projectId,
      title,
      decision: decisionText,
      rationale,
      implications: params.implications?.trim() || undefined,
      status: params.status ?? 'accepted',
      sourceChatId: params.sourceChatId,
      sourceMessageId: params.sourceMessageId,
      tags: Object.freeze(params.tags ? [...params.tags] : []),
      createdAt: now,
      updatedAt: now,
    };

    const saved = await this.decisionRepo.save(record);
    this.log.info(`Decision created: "${saved.title}" (${saved.id}) in project ${saved.projectId}`);
    return saved;
  }

  async getDecision(decisionId: EntityId): Promise<Decision | null> {
    return this.decisionRepo.findById(decisionId);
  }

  async getDecisionOrThrow(decisionId: EntityId, expectedProjectId?: EntityId): Promise<Decision> {
    const decision = await this.decisionRepo.findById(decisionId);
    if (!decision) {
      throw new NotFoundError('Decision', decisionId);
    }
    if (expectedProjectId && decision.projectId !== expectedProjectId) {
      throw new ValidationError(`Decision does not belong to project "${expectedProjectId}"`);
    }
    return decision;
  }

  async updateDecision(
    decisionId: EntityId,
    updates: {
      title?: string;
      decision?: string;
      rationale?: string;
      implications?: string | null;
      status?: DecisionStatus;
      tags?: readonly string[];
    },
    expectedProjectId?: EntityId,
  ): Promise<Decision> {
    const existing = await this.getDecisionOrThrow(decisionId, expectedProjectId);

    let title = existing.title;
    if (updates.title !== undefined) {
      title = validateNonEmptyString(updates.title, 'Decision title');
    }

    let decisionText = existing.decision;
    if (updates.decision !== undefined) {
      decisionText = validateNonEmptyString(updates.decision, 'Decision text');
    }

    let rationale = existing.rationale;
    if (updates.rationale !== undefined) {
      rationale = validateNonEmptyString(updates.rationale, 'Decision rationale');
    }

    const now = createCurrentTimestamp();
    const updated: Decision = {
      ...existing,
      title,
      decision: decisionText,
      rationale,
      implications:
        updates.implications !== undefined
          ? updates.implications?.trim() || undefined
          : existing.implications,
      status: updates.status ?? existing.status,
      tags: updates.tags !== undefined ? Object.freeze([...updates.tags]) : existing.tags,
      updatedAt: now,
    };

    const saved = await this.decisionRepo.save(updated);
    this.log.info(`Decision updated: "${saved.title}" (${saved.id})`);
    return saved;
  }

  async deleteDecision(decisionId: EntityId, expectedProjectId?: EntityId): Promise<boolean> {
    const existing = await this.getDecisionOrThrow(decisionId, expectedProjectId);
    const deleted = await this.decisionRepo.delete(decisionId);
    this.log.info(`Decision deleted: "${existing.title}" (${decisionId})`);
    return deleted;
  }

  async listDecisionsByProject(
    projectId: EntityId,
    options?: DecisionFilterOptions,
  ): Promise<readonly Decision[]> {
    const decisions = await this.decisionRepo.findByProjectId(projectId);
    return this.filterDecisions(decisions, options);
  }

  async listDecisionsByWorkspace(
    workspaceId: EntityId,
    options?: DecisionFilterOptions,
  ): Promise<readonly Decision[]> {
    const decisions = await this.decisionRepo.findByWorkspaceId(workspaceId);
    return this.filterDecisions(decisions, options);
  }

  private filterDecisions(
    decisions: readonly Decision[],
    options?: DecisionFilterOptions,
  ): readonly Decision[] {
    let filtered = [...decisions];

    if (options?.status) {
      filtered = filtered.filter((d) => d.status === options.status);
    }

    if (options?.tagId) {
      filtered = filtered.filter((d) => d.tags && d.tags.includes(options.tagId!));
    }

    return Object.freeze(filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  }
}
