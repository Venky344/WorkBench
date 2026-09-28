import { BaseService } from './base.service';
import { IRelationshipRepository } from '@/repositories/contracts/entity-repositories.contract';
import { Relationship, EntityType, RelationshipType } from '@/domain/entities';
import { generateEntityId } from '@/domain/value-objects/id';
import { createCurrentTimestamp } from '@/domain/value-objects/timestamp';
import { validateEntityType } from '@/domain/validation/entity.validator';
import { EntityId } from '@/types';

export class RelationshipService extends BaseService {
  private readonly relationshipRepo: IRelationshipRepository;

  constructor(relationshipRepo: IRelationshipRepository) {
    super('RelationshipService');
    this.relationshipRepo = relationshipRepo;
  }

  async linkEntities(params: {
    workspaceId: EntityId;
    sourceEntityType: EntityType;
    sourceEntityId: EntityId;
    relationshipType: RelationshipType;
    targetEntityType: EntityType;
    targetEntityId: EntityId;
    metadata?: Readonly<Record<string, string | number | boolean>>;
  }): Promise<Relationship> {
    validateEntityType(params.sourceEntityType, 'sourceEntityType');
    validateEntityType(params.targetEntityType, 'targetEntityType');

    const existing = await this.relationshipRepo.findRelationships(
      params.sourceEntityId,
      params.relationshipType,
      params.targetEntityId,
    );

    if (existing.length > 0 && existing[0]) {
      return existing[0];
    }

    const now = createCurrentTimestamp();
    const relationship: Relationship = {
      id: generateEntityId(),
      workspaceId: params.workspaceId,
      sourceEntityType: params.sourceEntityType,
      sourceEntityId: params.sourceEntityId,
      relationshipType: params.relationshipType,
      targetEntityType: params.targetEntityType,
      targetEntityId: params.targetEntityId,
      metadata: params.metadata,
      createdAt: now,
      updatedAt: now,
    };

    return this.relationshipRepo.save(relationship);
  }

  async unlinkEntities(
    sourceEntityId: EntityId,
    relationshipType: RelationshipType,
    targetEntityId: EntityId,
  ): Promise<number> {
    const relationships = await this.relationshipRepo.findRelationships(
      sourceEntityId,
      relationshipType,
      targetEntityId,
    );
    const ids = relationships.map((r) => r.id);
    return this.relationshipRepo.deleteBatch(ids);
  }

  async getEntityRelationships(
    entityType: EntityType,
    entityId: EntityId,
  ): Promise<{
    outgoing: readonly Relationship[];
    incoming: readonly Relationship[];
  }> {
    const outgoing = await this.relationshipRepo.findBySourceEntity(entityType, entityId);
    const incoming = await this.relationshipRepo.findByTargetEntity(entityType, entityId);
    return { outgoing, incoming };
  }
}
