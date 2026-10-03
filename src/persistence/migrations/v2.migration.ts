import { Migration } from './migration.interface';
import { STORES } from '../schema';

export const v2Migration: Migration = {
  version: 2,
  name: 'Add File Blobs Storage Store v2',
  up(db: IDBDatabase): void {
    if (!db.objectStoreNames.contains(STORES.FILE_BLOBS)) {
      const store = db.createObjectStore(STORES.FILE_BLOBS, {
        keyPath: 'storageKey',
        autoIncrement: false,
      });

      store.createIndex('by_createdAt', 'createdAt', { unique: false });
      store.createIndex('by_mimeType', 'mimeType', { unique: false });
    }
  },
};
