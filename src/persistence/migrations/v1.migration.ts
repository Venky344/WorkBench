import { Migration } from './migration.interface';
import { V1_STORES } from '../schema';

export const v1Migration: Migration = {
  version: 1,
  name: 'Initial Schema v1',
  up(db: IDBDatabase): void {
    for (const storeSchema of V1_STORES) {
      if (!db.objectStoreNames.contains(storeSchema.name)) {
        const store = db.createObjectStore(storeSchema.name, {
          keyPath: storeSchema.keyPath,
          autoIncrement: storeSchema.autoIncrement ?? false,
        });

        if (storeSchema.indexes) {
          for (const index of storeSchema.indexes) {
            store.createIndex(index.name, index.keyPath as string, {
              unique: index.unique ?? false,
              multiEntry: index.multiEntry ?? false,
            });
          }
        }
      }
    }
  },
};
