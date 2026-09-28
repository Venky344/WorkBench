import { BaseService } from './base.service';
import { IInboxItemRepository } from '@/repositories/contracts/entity-repositories.contract';
import { InboxItem, InboxCaptureType, EntityType } from '@/domain/entities';
import { generateEntityId } from '@/domain/value-objects/id';
import { createCurrentTimestamp } from '@/domain/value-objects/timestamp';
import { validateNonEmptyString } from '@/domain/validation/entity.validator';
import { EntityId } from '@/types';
import { ProvenanceRecord } from '@/domain/value-objects/provenance';

export class InboxService extends BaseService {
  private readonly inboxRepo: IInboxItemRepository;

  constructor(inboxRepo: IInboxItemRepository) {
    super('InboxService');
    this.inboxRepo = inboxRepo;
  }

  async captureItem(params: {
    workspaceId: EntityId;
    title: string;
    captureType: InboxCaptureType;
    rawContent?: string;
    targetEntityType?: EntityType;
    targetEntityId?: EntityId;
    sourceUrl?: string;
    sourceId?: EntityId;
    provenance?: ProvenanceRecord;
    suggestedProjectId?: EntityId;
    suggestedTags?: readonly string[];
  }): Promise<InboxItem> {
    const title = validateNonEmptyString(params.title, 'Inbox item title');
    const now = createCurrentTimestamp();

    const item: InboxItem = {
      id: generateEntityId(),
      workspaceId: params.workspaceId,
      title,
      captureType: params.captureType,
      rawContent: params.rawContent,
      targetEntityType: params.targetEntityType,
      targetEntityId: params.targetEntityId,
      sourceUrl: params.sourceUrl,
      sourceId: params.sourceId,
      provenance: params.provenance,
      suggestedProjectId: params.suggestedProjectId,
      suggestedTags: Object.freeze(params.suggestedTags ? [...params.suggestedTags] : []),
      status: 'unprocessed',
      createdAt: now,
      updatedAt: now,
    };

    return this.inboxRepo.save(item);
  }

  async markTriaged(id: EntityId): Promise<InboxItem> {
    const item = await this.inboxRepo.getOrThrow(id);
    const now = createCurrentTimestamp();
    const updated: InboxItem = {
      ...item,
      status: 'triaged',
      triagedAt: now,
      updatedAt: now,
    };
    return this.inboxRepo.save(updated);
  }

  async getUnprocessedItems(): Promise<readonly InboxItem[]> {
    return this.inboxRepo.findUnprocessed();
  }
}
