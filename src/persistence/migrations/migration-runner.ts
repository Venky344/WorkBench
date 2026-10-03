import { Migration } from './migration.interface';
import { v1Migration } from './v1.migration';
import { v2Migration } from './v2.migration';
import { DatabaseError } from '@/utils/errors';

export class MigrationRunner {
  private readonly migrations: readonly Migration[];

  constructor(migrations: readonly Migration[] = [v1Migration, v2Migration]) {
    this.migrations = [...migrations].sort((a, b) => a.version - b.version);
  }

  async runUpgrades(
    db: IDBDatabase,
    oldVersion: number,
    newVersion: number,
    transaction: IDBTransaction,
  ): Promise<void> {
    for (const migration of this.migrations) {
      if (migration.version > oldVersion && migration.version <= newVersion) {
        try {
          await migration.up(db, transaction);
        } catch (error) {
          throw new DatabaseError(
            `Migration failed for version ${migration.version} (${migration.name}): ${error instanceof Error ? error.message : String(error)}`,
            error,
          );
        }
      }
    }
  }

  getRegisteredMigrations(): readonly Migration[] {
    return this.migrations;
  }
}
