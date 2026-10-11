import { Migration } from './migration.interface';
import { STORES } from '../schema';

export const v3Migration: Migration = {
  version: 3,
  name: 'Add Project Memories Store v3',
  up(db: IDBDatabase): void {
    if (!db.objectStoreNames.contains(STORES.PROJECT_MEMORIES)) {
      const store = db.createObjectStore(STORES.PROJECT_MEMORIES, {
        keyPath: 'id',
        autoIncrement: false,
      });

      store.createIndex('by_workspaceId', 'workspaceId', { unique: false });
      store.createIndex('by_projectId', 'projectId', { unique: false });
      store.createIndex('by_type', 'type', { unique: false });
      store.createIndex('by_status', 'status', { unique: false });
      store.createIndex('by_importance', 'importance', { unique: false });
      store.createIndex('by_reviewDate', 'reviewDate', { unique: false });
    }
  },
};
