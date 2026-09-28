import { BaseService } from './base.service';
import { ISourceRepository } from '@/repositories/contracts/entity-repositories.contract';
import { Source } from '@/domain/entities';
import { generateEntityId } from '@/domain/value-objects/id';
import { createCurrentTimestamp } from '@/domain/value-objects/timestamp';
import { validateNonEmptyString } from '@/domain/validation/entity.validator';
import { EntityId, ISOTimestamp } from '@/types';
import { SourceProvider } from '@/domain/value-objects/provenance';

export class SourceService extends BaseService {
  private readonly sourceRepo: ISourceRepository;

  constructor(sourceRepo: ISourceRepository) {
    super('SourceService');
    this.sourceRepo = sourceRepo;
  }

  async registerSource(params: {
    workspaceId: EntityId;
    provider: SourceProvider;
    displayName: string;
    externalId?: string;
    sourceUrl?: string;
    author?: string;
    importedAt?: ISOTimestamp;
    metadata?: Readonly<Record<string, string | number | boolean>>;
  }): Promise<Source> {
    const displayName = validateNonEmptyString(params.displayName, 'Source display name');
    const now = createCurrentTimestamp();

    const source: Source = {
      id: generateEntityId(),
      workspaceId: params.workspaceId,
      provider: params.provider,
      displayName,
      externalId: params.externalId,
      sourceUrl: params.sourceUrl,
      author: params.author,
      importedAt: params.importedAt ?? now,
      metadata: params.metadata,
      createdAt: now,
      updatedAt: now,
    };

    return this.sourceRepo.save(source);
  }
}
