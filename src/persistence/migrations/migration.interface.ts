/**
 * Database schema migration interface.
 */
export interface Migration {
  readonly version: number;
  readonly name: string;
  up(db: IDBDatabase, transaction?: IDBTransaction): Promise<void> | void;
  down?(db: IDBDatabase, transaction?: IDBTransaction): Promise<void> | void;
}
