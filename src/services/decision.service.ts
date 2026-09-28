import { BaseService } from './base.service';
import { IDecisionRepository } from '@/repositories/contracts/entity-repositories.contract';
import { Decision, DecisionStatus } from '@/domain/entities';
import { generateEntityId } from '@/domain/value-objects/id';
import { createCurrentTimestamp } from '@/domain/value-objects/timestamp';
import { validateNonEmptyString } from '@/domain/validation/entity.validator';
import { EntityId } from '@/types';

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
      implications: params.implications,
      status: params.status ?? 'accepted',
      sourceChatId: params.sourceChatId,
      sourceMessageId: params.sourceMessageId,
      tags: Object.freeze(params.tags ? [...params.tags] : []),
      createdAt: now,
      updatedAt: now,
    };

    return this.decisionRepo.save(record);
  }
}
