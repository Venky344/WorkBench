/**
 * Universal Storage Engine contract decoupling persistence from domain logic.
 * Designed to allow seamless substitution of browser IndexedDB with desktop SQLite.
 */

export interface StorageIndexDefinition {
  readonly name: string;
  readonly keyPath: string | readonly string[];
  readonly unique?: boolean;
  readonly multiEntry?: boolean;
}

export interface StoreSchema {
  readonly name: string;
  readonly keyPath: string;
  readonly autoIncrement?: boolean;
  readonly indexes?: readonly StorageIndexDefinition[];
}

export interface DatabaseSchema {
  readonly name: string;
  readonly version: number;
  readonly stores: readonly StoreSchema[];
}

export interface StorageQuery<T = unknown> {
  readonly indexName?: string;
  readonly indexValue?: IDBValidKey;
  readonly limit?: number;
  readonly offset?: number;
  readonly predicate?: (item: T) => boolean;
}

/**
 * Storage adapter interface implemented by IndexedDB and future SQLite adapters.
 */
export interface IStorageEngine {
  open(): Promise<void>;
  close(): Promise<void>;
  isOpen(): boolean;
  get<T>(storeName: string, id: string): Promise<T | null>;
  getAll<T>(storeName: string): Promise<readonly T[]>;
  find<T>(storeName: string, query?: StorageQuery<T>): Promise<readonly T[]>;
  put<T extends { id: string }>(storeName: string, item: T): Promise<T>;
  putBatch<T extends { id: string }>(storeName: string, items: readonly T[]): Promise<readonly T[]>;
  delete(storeName: string, id: string): Promise<boolean>;
  deleteBatch(storeName: string, ids: readonly string[]): Promise<number>;
  count(storeName: string): Promise<number>;
  clear(storeName: string): Promise<void>;
  clearAll(): Promise<void>;
}
