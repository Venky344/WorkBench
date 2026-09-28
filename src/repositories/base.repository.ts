import { BaseEntity } from '@/domain/entities/base.entity';
import { EntityId } from '@/types';
import { NotFoundError } from '@/utils/errors';
import { IRepository } from './contracts/repository.interface';

export * from './contracts';
export * from './storage';

/**
 * Universal in-memory repository implementation used for testing and architecture verification.
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
    return Object.freeze(Array.from(this.items.values()));
  }

  async save(entity: T): Promise<T> {
    this.items.set(entity.id, Object.freeze({ ...entity }));
    return entity;
  }

  async saveBatch(entities: readonly T[]): Promise<readonly T[]> {
    for (const entity of entities) {
      await this.save(entity);
    }
    return Object.freeze([...entities]);
  }

  async delete(id: EntityId): Promise<boolean> {
    return this.items.delete(id);
  }

  async deleteBatch(ids: readonly EntityId[]): Promise<number> {
    let count = 0;
    for (const id of ids) {
      if (this.items.delete(id)) {
        count++;
      }
    }
    return count;
  }

  async exists(id: EntityId): Promise<boolean> {
    return this.items.has(id);
  }

  async count(): Promise<number> {
    return this.items.size;
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
