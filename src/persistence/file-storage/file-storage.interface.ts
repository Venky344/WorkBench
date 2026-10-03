/**
 * File Storage abstraction decoupling physical binary byte storage from domain metadata.
 * Designed to allow seamless substitution of browser IndexedDB binary storage with desktop filesystem.
 */

export interface StoredBlobRecord {
  readonly storageKey: string;
  readonly blob: Blob | ArrayBuffer | Uint8Array;
  readonly sizeBytes: number;
  readonly mimeType: string;
  readonly createdAt: string;
}

export interface IFileStorage {
  /**
   * Initializes the underlying storage provider if necessary.
   */
  open(): Promise<void>;

  /**
   * Closes the underlying storage provider connection.
   */
  close(): Promise<void>;

  /**
   * Checks if the storage engine is currently open.
   */
  isOpen(): boolean;

  /**
   * Saves binary data and associates it with a unique storage key.
   * Accepts Blob, Uint8Array, or ArrayBuffer.
   */
  saveFile(
    storageKey: string,
    data: Blob | Uint8Array | ArrayBuffer,
    mimeType?: string,
  ): Promise<string>;

  /**
   * Reads the stored binary data as a Blob by its storage key.
   * Returns null if not found.
   */
  readFile(storageKey: string): Promise<Blob | null>;

  /**
   * Deletes the stored binary bytes by storage key.
   * Returns true if deleted, false if not found.
   */
  deleteFile(storageKey: string): Promise<boolean>;

  /**
   * Checks if a file blob exists for the given storage key.
   */
  fileExists(storageKey: string): Promise<boolean>;

  /**
   * Clears all stored blobs (useful for testing or workspace reset).
   */
  clearAll?(): Promise<void>;
}
