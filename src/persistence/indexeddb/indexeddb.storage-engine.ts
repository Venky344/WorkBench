import { IStorageEngine, StorageQuery } from '../storage.interface';
import { IndexedDbDatabase } from './indexeddb.database';
import { DatabaseError } from '@/utils/errors';
import { EntitySerializer } from '../serializers/entity.serializer';
import { BaseEntity } from '@/domain/entities/base.entity';

export class IndexedDbStorageEngine implements IStorageEngine {
  private readonly databaseManager: IndexedDbDatabase;

  constructor(databaseManager: IndexedDbDatabase = new IndexedDbDatabase()) {
    this.databaseManager = databaseManager;
  }

  async open(): Promise<void> {
    await this.databaseManager.open();
  }

  async close(): Promise<void> {
    this.databaseManager.close();
  }

  isOpen(): boolean {
    return this.databaseManager.isOpen();
  }

  private getDb(): IDBDatabase {
    return this.databaseManager.getDatabaseInstance();
  }

  async get<T>(storeName: string, id: string): Promise<T | null> {
    const db = this.getDb();
    return new Promise<T | null>((resolve, reject) => {
      try {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const request = store.get(id);

        request.onsuccess = () => {
          const result = request.result;
          if (result === undefined) {
            resolve(null);
          } else {
            resolve(EntitySerializer.deserialize<T & BaseEntity>(result) as unknown as T);
          }
        };

        request.onerror = () => {
          reject(
            new DatabaseError(
              `Failed to get item "${id}" from "${storeName}": ${request.error?.message ?? ''}`,
              request.error,
            ),
          );
        };
      } catch (err) {
        reject(
          new DatabaseError(`Transaction error getting item "${id}" from "${storeName}"`, err),
        );
      }
    });
  }

  async getAll<T>(storeName: string): Promise<readonly T[]> {
    const db = this.getDb();
    return new Promise<readonly T[]>((resolve, reject) => {
      try {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const request = store.getAll();

        request.onsuccess = () => {
          const results = request.result ?? [];
          const deserialized = results.map(
            (r) => EntitySerializer.deserialize<T & BaseEntity>(r) as unknown as T,
          );
          resolve(Object.freeze(deserialized));
        };

        request.onerror = () => {
          reject(
            new DatabaseError(
              `Failed to getAll from "${storeName}": ${request.error?.message ?? ''}`,
              request.error,
            ),
          );
        };
      } catch (err) {
        reject(new DatabaseError(`Transaction error fetching all from "${storeName}"`, err));
      }
    });
  }

  async find<T>(storeName: string, query?: StorageQuery<T>): Promise<readonly T[]> {
    const db = this.getDb();
    return new Promise<readonly T[]>((resolve, reject) => {
      try {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);

        let request: IDBRequest<unknown[]>;

        if (query?.indexName && query.indexValue !== undefined) {
          const index = store.index(query.indexName);
          request = index.getAll(query.indexValue);
        } else {
          request = store.getAll();
        }

        request.onsuccess = () => {
          let results = (request.result ?? []).map(
            (r) => EntitySerializer.deserialize<T & BaseEntity>(r) as unknown as T,
          );

          if (query?.predicate) {
            results = results.filter(query.predicate);
          }

          if (query?.offset && query.offset > 0) {
            results = results.slice(query.offset);
          }

          if (query?.limit && query.limit > 0) {
            results = results.slice(0, query.limit);
          }

          resolve(Object.freeze(results));
        };

        request.onerror = () => {
          reject(
            new DatabaseError(
              `Failed to execute query on "${storeName}": ${request.error?.message ?? ''}`,
              request.error,
            ),
          );
        };
      } catch (err) {
        reject(new DatabaseError(`Transaction error executing query on "${storeName}"`, err));
      }
    });
  }

  async put<T extends { id: string }>(storeName: string, item: T): Promise<T> {
    const db = this.getDb();
    const serialized = EntitySerializer.serialize(item as unknown as BaseEntity);

    return new Promise<T>((resolve, reject) => {
      try {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const request = store.put(serialized);

        request.onsuccess = () => {
          resolve(EntitySerializer.deserialize<T & BaseEntity>(serialized) as unknown as T);
        };

        request.onerror = () => {
          reject(
            new DatabaseError(
              `Failed to save item to "${storeName}": ${request.error?.message ?? ''}`,
              request.error,
            ),
          );
        };
      } catch (err) {
        reject(new DatabaseError(`Transaction error saving to "${storeName}"`, err));
      }
    });
  }

  async putBatch<T extends { id: string }>(
    storeName: string,
    items: readonly T[],
  ): Promise<readonly T[]> {
    if (items.length === 0) {
      return [];
    }

    const db = this.getDb();
    const serializedList = items.map((item) =>
      EntitySerializer.serialize(item as unknown as BaseEntity),
    );

    return new Promise<readonly T[]>((resolve, reject) => {
      try {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);

        for (const record of serializedList) {
          store.put(record);
        }

        tx.oncomplete = () => {
          const deserialized = serializedList.map(
            (r) => EntitySerializer.deserialize<T & BaseEntity>(r) as unknown as T,
          );
          resolve(Object.freeze(deserialized));
        };

        tx.onerror = () => {
          reject(
            new DatabaseError(
              `Batch save transaction failed on "${storeName}": ${tx.error?.message ?? ''}`,
              tx.error,
            ),
          );
        };
      } catch (err) {
        reject(new DatabaseError(`Transaction error in putBatch on "${storeName}"`, err));
      }
    });
  }

  async delete(storeName: string, id: string): Promise<boolean> {
    const db = this.getDb();
    return new Promise<boolean>((resolve, reject) => {
      try {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const checkReq = store.get(id);

        checkReq.onsuccess = () => {
          if (checkReq.result === undefined) {
            resolve(false);
            return;
          }

          const delReq = store.delete(id);
          delReq.onsuccess = () => resolve(true);
          delReq.onerror = () =>
            reject(new DatabaseError(`Failed to delete "${id}" from "${storeName}"`, delReq.error));
        };

        checkReq.onerror = () => {
          reject(
            new DatabaseError(
              `Failed to verify existence of "${id}" in "${storeName}"`,
              checkReq.error,
            ),
          );
        };
      } catch (err) {
        reject(new DatabaseError(`Transaction error deleting from "${storeName}"`, err));
      }
    });
  }

  async deleteBatch(storeName: string, ids: readonly string[]): Promise<number> {
    if (ids.length === 0) {
      return 0;
    }

    const db = this.getDb();
    return new Promise<number>((resolve, reject) => {
      try {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        let deletedCount = 0;

        for (const id of ids) {
          const req = store.delete(id);
          req.onsuccess = () => {
            deletedCount++;
          };
        }

        tx.oncomplete = () => {
          resolve(deletedCount);
        };

        tx.onerror = () => {
          reject(
            new DatabaseError(`Transaction failed during batch delete on "${storeName}"`, tx.error),
          );
        };
      } catch (err) {
        reject(new DatabaseError(`Transaction error in deleteBatch on "${storeName}"`, err));
      }
    });
  }

  async count(storeName: string): Promise<number> {
    const db = this.getDb();
    return new Promise<number>((resolve, reject) => {
      try {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const req = store.count();

        req.onsuccess = () => {
          resolve(req.result);
        };

        req.onerror = () => {
          reject(new DatabaseError(`Failed to count items in "${storeName}"`, req.error));
        };
      } catch (err) {
        reject(new DatabaseError(`Transaction error counting in "${storeName}"`, err));
      }
    });
  }

  async clear(storeName: string): Promise<void> {
    const db = this.getDb();
    return new Promise<void>((resolve, reject) => {
      try {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const req = store.clear();

        req.onsuccess = () => resolve();
        req.onerror = () =>
          reject(new DatabaseError(`Failed to clear store "${storeName}"`, req.error));
      } catch (err) {
        reject(new DatabaseError(`Transaction error clearing "${storeName}"`, err));
      }
    });
  }

  async clearAll(): Promise<void> {
    const db = this.getDb();
    const storeNames = Array.from(db.objectStoreNames);
    if (storeNames.length === 0) {
      return;
    }

    return new Promise<void>((resolve, reject) => {
      try {
        const tx = db.transaction(storeNames, 'readwrite');
        for (const name of storeNames) {
          tx.objectStore(name).clear();
        }

        tx.oncomplete = () => resolve();
        tx.onerror = () =>
          reject(new DatabaseError('Failed to clear all database stores', tx.error));
      } catch (err) {
        reject(new DatabaseError('Transaction error clearing all stores', err));
      }
    });
  }
}
