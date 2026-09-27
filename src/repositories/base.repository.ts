import { BaseEntity } from '@/domain/types';
import { EntityId } from '@/types';
import { NotFoundError } from '@/utils/errors';

/**
 * Universal repository contract decoupling persistence from domain logic.
 */
export interface IRepository<T extends BaseEntity> {
  findById(id: EntityId): Promise<T | null>;
  findAll(): Promise<readonly T[]>;
  save(entity: T): Promise<T>;
  delete(id: EntityId): Promise<boolean>;
  exists(id: EntityId): Promise<boolean>;
}

/**
 * In-memory repository implementation used for testing and architecture verification
 * before permanent storage layers (IndexedDB/SQLite) are introduced in later phases.
 */
export class InMemoryRepository<T extends BaseEntity> implements IRepository<T> {
  protected readonly items = new Map<EntityId, T>();
  protected readonly entityName: string;

  constructor(entityName = 'Entity') {
    this.entityName = entityName;
  }

  async findById(id: EntityId): Promise<T | null> {
    return this.items.get(id) ?? null;
  }

  async findAll(): Promise<readonly T[]> {
    return Array.from(this.items.values());
  }

  async save(entity: T): Promise<T> {
    this.items.set(entity.id, entity);
    return entity;
  }

  async delete(id: EntityId): Promise<boolean> {
    return this.items.delete(id);
  }

  async exists(id: EntityId): Promise<boolean> {
    return this.items.has(id);
  }

  async getOrThrow(id: EntityId): Promise<T> {
    const item = await this.findById(id);
    if (!item) {
      throw new NotFoundError(this.entityName, id);
    }
    return item;
  }

  clear(): void {
    this.items.clear();
  }
}
