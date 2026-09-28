import { MigrationRunner } from '../migrations/migration-runner';
import { WORKBENCH_DB_NAME, WORKBENCH_DB_VERSION } from '../schema';
import { DatabaseError } from '@/utils/errors';
import { ILogger, logger } from '@/utils/logger';

export class IndexedDbDatabase {
  private db: IDBDatabase | null = null;
  private readonly dbName: string;
  private readonly version: number;
  private readonly migrationRunner: MigrationRunner;
  private readonly log: ILogger;

  constructor(
    dbName: string = WORKBENCH_DB_NAME,
    version: number = WORKBENCH_DB_VERSION,
    migrationRunner: MigrationRunner = new MigrationRunner(),
  ) {
    this.dbName = dbName;
    this.version = version;
    this.migrationRunner = migrationRunner;
    this.log = logger.createChild('IndexedDbDatabase');
  }

  async open(): Promise<IDBDatabase> {
    if (this.db) {
      return this.db;
    }

    if (typeof indexedDB === 'undefined') {
      throw new DatabaseError('IndexedDB is not available in the current environment');
    }

    return new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onupgradeneeded = (event) => {
        const db = request.result;
        const transaction = request.transaction;
        const oldVersion = event.oldVersion;
        const newVersion = event.newVersion ?? this.version;

        this.log.info(`Upgrading IndexedDB schema from v${oldVersion} to v${newVersion}`);

        if (transaction) {
          void this.migrationRunner.runUpgrades(db, oldVersion, newVersion, transaction);
        }
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.db.onversionchange = () => {
          this.log.warn(
            'Database version change requested elsewhere. Closing database connection.',
          );
          this.close();
        };
        this.log.debug(`Database ${this.dbName} opened successfully (v${this.version})`);
        resolve(this.db);
      };

      request.onerror = () => {
        const error = request.error;
        this.log.error(`Failed to open IndexedDB database "${this.dbName}"`, error);
        reject(
          new DatabaseError(
            `Failed to open IndexedDB "${this.dbName}": ${error?.message ?? 'Unknown error'}`,
            error,
          ),
        );
      };

      request.onblocked = () => {
        this.log.warn(`Database open request blocked for "${this.dbName}"`);
      };
    });
  }

  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.log.debug(`Database ${this.dbName} closed`);
    }
  }

  isOpen(): boolean {
    return this.db !== null;
  }

  getDatabaseInstance(): IDBDatabase {
    if (!this.db) {
      throw new DatabaseError(`Database "${this.dbName}" is not open. Call open() first.`);
    }
    return this.db;
  }
}
