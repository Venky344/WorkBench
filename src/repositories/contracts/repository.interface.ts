import { BaseEntity } from '@/domain/entities/base.entity';
import { EntityId } from '@/types';

/**
 * Universal repository contract decoupling domain operations from physical storage engines.
 */
export interface IRepository<T extends BaseEntity> {
  findById(id: EntityId): Promise<T | null>;
  findAll(): Promise<readonly T[]>;
  save(entity: T): Promise<T>;
  saveBatch(entities: readonly T[]): Promise<readonly T[]>;
  delete(id: EntityId): Promise<boolean>;
  deleteBatch(ids: readonly EntityId[]): Promise<number>;
  exists(id: EntityId): Promise<boolean>;
  count(): Promise<number>;
  getOrThrow(id: EntityId): Promise<T>;
}
