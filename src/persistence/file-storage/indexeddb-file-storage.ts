import { IFileStorage, StoredBlobRecord } from './file-storage.interface';
import { IndexedDbDatabase } from '../indexeddb/indexeddb.database';
import { STORES } from '../schema';
import { DatabaseError } from '@/utils/errors';
import { createCurrentTimestamp } from '@/domain/value-objects/timestamp';

export class IndexedDbFileStorage implements IFileStorage {
  private readonly databaseManager: IndexedDbDatabase;
  private readonly storeName: string = STORES.FILE_BLOBS;

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

  async saveFile(
    storageKey: string,
    data: Blob | Uint8Array | ArrayBuffer,
    mimeType = 'application/octet-stream',
  ): Promise<string> {
    if (!this.isOpen()) {
      await this.open();
    }
    const db = this.getDb();

    let buffer: ArrayBuffer;
    let sizeBytes: number;
    let finalMimeType = mimeType;

    if (data instanceof Blob) {
      buffer = await data.arrayBuffer();
      sizeBytes = data.size;
      finalMimeType = data.type || mimeType;
    } else if (data instanceof Uint8Array) {
      const copy = new Uint8Array(data.byteLength);
      copy.set(data);
      buffer = copy.buffer;
      sizeBytes = data.byteLength;
    } else {
      buffer = data;
      sizeBytes = data.byteLength;
    }

    const record: StoredBlobRecord = {
      storageKey,
      blob: buffer,
      sizeBytes,
      mimeType: finalMimeType,
      createdAt: createCurrentTimestamp(),
    };

    return new Promise<string>((resolve, reject) => {
      try {
        const tx = db.transaction(this.storeName, 'readwrite');
        const store = tx.objectStore(this.storeName);
        const request = store.put(record);

        request.onsuccess = () => {
          resolve(storageKey);
        };

        request.onerror = () => {
          reject(
            new DatabaseError(
              `Failed to store file blob with key "${storageKey}": ${request.error?.message ?? 'Unknown error'}`,
              request.error,
            ),
          );
        };
      } catch (err) {
        reject(
          new DatabaseError(`Transaction error storing file blob with key "${storageKey}"`, err),
        );
      }
    });
  }

  async readFile(storageKey: string): Promise<Blob | null> {
    if (!this.isOpen()) {
      await this.open();
    }
    const db = this.getDb();

    return new Promise<Blob | null>((resolve, reject) => {
      try {
        const tx = db.transaction(this.storeName, 'readonly');
        const store = tx.objectStore(this.storeName);
        const request = store.get(storageKey);

        request.onsuccess = () => {
          const result = request.result as StoredBlobRecord | undefined;
          if (!result) {
            resolve(null);
          } else {
            const finalBlob = new Blob([result.blob as ArrayBuffer], {
              type: result.mimeType || 'application/octet-stream',
            });
            resolve(finalBlob);
          }
        };

        request.onerror = () => {
          reject(
            new DatabaseError(
              `Failed to read file blob with key "${storageKey}": ${request.error?.message ?? 'Unknown error'}`,
              request.error,
            ),
          );
        };
      } catch (err) {
        reject(
          new DatabaseError(`Transaction error reading file blob with key "${storageKey}"`, err),
        );
      }
    });
  }

  async deleteFile(storageKey: string): Promise<boolean> {
    if (!this.isOpen()) {
      await this.open();
    }
    const db = this.getDb();

    return new Promise<boolean>((resolve, reject) => {
      try {
        const tx = db.transaction(this.storeName, 'readwrite');
        const store = tx.objectStore(this.storeName);
        const request = store.delete(storageKey);

        request.onsuccess = () => {
          resolve(true);
        };

        request.onerror = () => {
          reject(
            new DatabaseError(
              `Failed to delete file blob with key "${storageKey}": ${request.error?.message ?? 'Unknown error'}`,
              request.error,
            ),
          );
        };
      } catch (err) {
        reject(
          new DatabaseError(`Transaction error deleting file blob with key "${storageKey}"`, err),
        );
      }
    });
  }

  async fileExists(storageKey: string): Promise<boolean> {
    if (!this.isOpen()) {
      await this.open();
    }
    const db = this.getDb();

    return new Promise<boolean>((resolve, reject) => {
      try {
        const tx = db.transaction(this.storeName, 'readonly');
        const store = tx.objectStore(this.storeName);
        const request = store.count(IDBKeyRange.only(storageKey));

        request.onsuccess = () => {
          resolve(request.result > 0);
        };

        request.onerror = () => {
          reject(
            new DatabaseError(
              `Failed to check existence for file blob "${storageKey}": ${request.error?.message ?? 'Unknown error'}`,
              request.error,
            ),
          );
        };
      } catch (err) {
        reject(
          new DatabaseError(`Transaction error checking existence for key "${storageKey}"`, err),
        );
      }
    });
  }

  async clearAll(): Promise<void> {
    if (!this.isOpen()) {
      await this.open();
    }
    const db = this.getDb();

    return new Promise<void>((resolve, reject) => {
      try {
        const tx = db.transaction(this.storeName, 'readwrite');
        const store = tx.objectStore(this.storeName);
        const request = store.clear();

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = () => {
          reject(
            new DatabaseError(
              `Failed to clear file blobs store: ${request.error?.message ?? 'Unknown error'}`,
              request.error,
            ),
          );
        };
      } catch (err) {
        reject(new DatabaseError('Transaction error clearing file blobs store', err));
      }
    });
  }
}
