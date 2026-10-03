import { IFileStorage, StoredBlobRecord } from './file-storage.interface';
import { createCurrentTimestamp } from '@/domain/value-objects/timestamp';

export class MemoryFileStorage implements IFileStorage {
  private readonly blobs = new Map<string, StoredBlobRecord>();
  private openState = false;

  async open(): Promise<void> {
    this.openState = true;
  }

  async close(): Promise<void> {
    this.openState = false;
  }

  isOpen(): boolean {
    return this.openState;
  }

  async saveFile(
    storageKey: string,
    data: Blob | Uint8Array | ArrayBuffer,
    mimeType = 'application/octet-stream',
  ): Promise<string> {
    let blob: Blob;
    let sizeBytes: number;

    if (data instanceof Blob) {
      blob = data;
      sizeBytes = data.size;
    } else if (data instanceof Uint8Array) {
      blob = new Blob([data as unknown as BlobPart], { type: mimeType });
      sizeBytes = data.byteLength;
    } else {
      blob = new Blob([data as unknown as BlobPart], { type: mimeType });
      sizeBytes = data.byteLength;
    }

    this.blobs.set(storageKey, {
      storageKey,
      blob,
      sizeBytes,
      mimeType: blob.type || mimeType,
      createdAt: createCurrentTimestamp(),
    });

    return storageKey;
  }

  async readFile(storageKey: string): Promise<Blob | null> {
    const record = this.blobs.get(storageKey);
    if (!record) return null;
    return record.blob instanceof Blob
      ? record.blob
      : new Blob([record.blob as unknown as BlobPart], { type: record.mimeType });
  }

  async deleteFile(storageKey: string): Promise<boolean> {
    return this.blobs.delete(storageKey);
  }

  async fileExists(storageKey: string): Promise<boolean> {
    return this.blobs.has(storageKey);
  }

  async clearAll(): Promise<void> {
    this.blobs.clear();
  }
}
