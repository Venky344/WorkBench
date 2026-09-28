import 'fake-indexeddb/auto';
import { describe, it, expect } from 'vitest';
import { MigrationRunner } from '@/persistence/migrations/migration-runner';
import { Migration } from '@/persistence/migrations/migration.interface';
import { v1Migration } from '@/persistence/migrations/v1.migration';
import { IndexedDbDatabase } from '@/persistence/indexeddb/indexeddb.database';
import { V1_STORES } from '@/persistence/schema';

describe('Schema Migrations Engine', () => {
  it('registers and orders migrations by version', () => {
    const mockV2: Migration = {
      version: 2,
      name: 'v2 Migration',
      up: () => {},
    };

    const runner = new MigrationRunner([mockV2, v1Migration]);
    const registered = runner.getRegisteredMigrations();

    expect(registered[0]?.version).toBe(1);
    expect(registered[1]?.version).toBe(2);
  });

  it('initializes all v1 object stores during database creation', async () => {
    const testDbName = `migration_test_${Date.now()}`;
    const dbManager = new IndexedDbDatabase(testDbName, 1);
    const db = await dbManager.open();

    for (const storeSchema of V1_STORES) {
      expect(db.objectStoreNames.contains(storeSchema.name)).toBe(true);
    }

    dbManager.close();
  });

  it('runs incremental migration when upgrading version', async () => {
    const testDbName = `migration_upgrade_${Date.now()}`;

    // Step 1: Initialize v1
    const v1Manager = new IndexedDbDatabase(testDbName, 1);
    await v1Manager.open();
    v1Manager.close();

    // Step 2: Create v2 migration
    let v2Ran = false;
    const v2Migration: Migration = {
      version: 2,
      name: 'Add Custom Store',
      up(db: IDBDatabase) {
        db.createObjectStore('custom_v2_store', { keyPath: 'id' });
        v2Ran = true;
      },
    };

    const customRunner = new MigrationRunner([v1Migration, v2Migration]);
    const v2Manager = new IndexedDbDatabase(testDbName, 2, customRunner);
    const upgradedDb = await v2Manager.open();

    expect(v2Ran).toBe(true);
    expect(upgradedDb.version).toBe(2);
    expect(upgradedDb.objectStoreNames.contains('custom_v2_store')).toBe(true);

    v2Manager.close();
  });
});
