import { BaseEntity } from '@/domain/entities/base.entity';
import { EntityId } from '@/types';
import { IRepository } from '../contracts/repository.interface';
import { IStorageEngine } from '@/persistence/storage.interface';
import { NotFoundError } from '@/utils/errors';

/**
 * Universal storage-backed repository implementation.
 * Operates purely on the IStorageEngine interface, completely storage-agnostic.
 */
export class StorageRepository<T extends BaseEntity> implements IRepository<T> {
  protected readonly storage: IStorageEngine;
  protected readonly storeName: string;
  protected readonly entityName: string;

  constructor(storage: IStorageEngine, storeName: string, entityName = 'Entity') {
    this.storage = storage;
    this.storeName = storeName;
    this.entityName = entityName;
  }

  async findById(id: EntityId): Promise<T | null> {
    return this.storage.get<T>(this.storeName, id);
  }

  async findAll(): Promise<readonly T[]> {
    return this.storage.getAll<T>(this.storeName);
  }

  async save(entity: T): Promise<T> {
    return this.storage.put<T>(this.storeName, entity);
  }

  async saveBatch(entities: readonly T[]): Promise<readonly T[]> {
    return this.storage.putBatch<T>(this.storeName, entities);
  }

  async delete(id: EntityId): Promise<boolean> {
    return this.storage.delete(this.storeName, id);
  }

  async deleteBatch(ids: readonly EntityId[]): Promise<number> {
    return this.storage.deleteBatch(this.storeName, ids);
  }

  async exists(id: EntityId): Promise<boolean> {
    const item = await this.storage.get<T>(this.storeName, id);
    return item !== null;
  }

  async count(): Promise<number> {
    return this.storage.count(this.storeName);
  }

  async getOrThrow(id: EntityId): Promise<T> {
    const item = await this.findById(id);
    if (!item) {
      throw new NotFoundError(this.entityName, id);
    }
    return item;
  }
}
