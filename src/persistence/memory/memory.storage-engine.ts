import { IStorageEngine, StorageQuery } from '../storage.interface';
import { EntitySerializer } from '../serializers/entity.serializer';
import { BaseEntity } from '@/domain/entities/base.entity';

export class MemoryStorageEngine implements IStorageEngine {
  private readonly stores = new Map<string, Map<string, Record<string, unknown>>>();
  private openState = false;

  async open(): Promise<void> {
    this.openState = true;
  }

  async close(): Promise<void> {
    this.openState = false;
  }

  isOpen(): boolean {
    return this.openState;
  }

  private getStore(name: string): Map<string, Record<string, unknown>> {
    let store = this.stores.get(name);
    if (!store) {
      store = new Map<string, Record<string, unknown>>();
      this.stores.set(name, store);
    }
    return store;
  }

  async get<T>(storeName: string, id: string): Promise<T | null> {
    const store = this.getStore(storeName);
    const item = store.get(id);
    if (!item) {
      return null;
    }
    return EntitySerializer.deserialize<T & BaseEntity>(item) as unknown as T;
  }

  async getAll<T>(storeName: string): Promise<readonly T[]> {
    const store = this.getStore(storeName);
    const items = Array.from(store.values()).map(
      (r) => EntitySerializer.deserialize<T & BaseEntity>(r) as unknown as T,
    );
    return Object.freeze(items);
  }

  async find<T>(storeName: string, query?: StorageQuery<T>): Promise<readonly T[]> {
    const store = this.getStore(storeName);
    let items = Array.from(store.values()).map(
      (r) => EntitySerializer.deserialize<T & BaseEntity>(r) as unknown as T,
    );

    if (query?.indexName && query.indexValue !== undefined) {
      const key = query.indexName.replace(/^by_/, '');
      items = items.filter((item) => {
        const val = (item as Record<string, unknown>)[key];
        return val === query.indexValue;
      });
    }

    if (query?.predicate) {
      items = items.filter(query.predicate);
    }

    if (query?.offset && query.offset > 0) {
      items = items.slice(query.offset);
    }

    if (query?.limit && query.limit > 0) {
      items = items.slice(0, query.limit);
    }

    return Object.freeze(items);
  }

  async put<T extends { id: string }>(storeName: string, item: T): Promise<T> {
    const store = this.getStore(storeName);
    const serialized = EntitySerializer.serialize(item as unknown as BaseEntity);
    store.set(item.id, serialized);
    return EntitySerializer.deserialize<T & BaseEntity>(serialized) as unknown as T;
  }

  async putBatch<T extends { id: string }>(
    storeName: string,
    items: readonly T[],
  ): Promise<readonly T[]> {
    const saved: T[] = [];
    for (const item of items) {
      saved.push(await this.put(storeName, item));
    }
    return Object.freeze(saved);
  }

  async delete(storeName: string, id: string): Promise<boolean> {
    const store = this.getStore(storeName);
    return store.delete(id);
  }

  async deleteBatch(storeName: string, ids: readonly string[]): Promise<number> {
    const store = this.getStore(storeName);
    let count = 0;
    for (const id of ids) {
      if (store.delete(id)) {
        count++;
      }
    }
    return count;
  }

  async count(storeName: string): Promise<number> {
    const store = this.getStore(storeName);
    return store.size;
  }

  async clear(storeName: string): Promise<void> {
    const store = this.getStore(storeName);
    store.clear();
  }

  async clearAll(): Promise<void> {
    this.stores.clear();
  }
}
