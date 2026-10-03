import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MemoryFileStorage } from '@/persistence/file-storage/memory-file-storage';
import { IndexedDbFileStorage } from '@/persistence/file-storage/indexeddb-file-storage';
import { IndexedDbDatabase } from '@/persistence/indexeddb/indexeddb.database';
import 'fake-indexeddb/auto';

describe('File Storage Layer', () => {
  describe('MemoryFileStorage', () => {
    let storage: MemoryFileStorage;

    beforeEach(async () => {
      storage = new MemoryFileStorage();
      await storage.open();
    });

    afterEach(async () => {
      await storage.close();
    });

    it('stores and retrieves binary blobs', async () => {
      const data = new TextEncoder().encode('Hello WorkBench');
      const key = 'file_test_123';

      await storage.saveFile(key, data, 'text/plain');

      const exists = await storage.fileExists(key);
      expect(exists).toBe(true);

      const retrieved = await storage.readFile(key);
      expect(retrieved).not.toBeNull();
      expect(retrieved?.size).toBe(data.byteLength);
      expect(retrieved?.type).toBe('text/plain');

      const text = await retrieved?.text();
      expect(text).toBe('Hello WorkBench');
    });

    it('deletes stored file bytes', async () => {
      const key = 'file_delete_me';
      await storage.saveFile(key, new Uint8Array([1, 2, 3, 4]));

      expect(await storage.fileExists(key)).toBe(true);

      const deleted = await storage.deleteFile(key);
      expect(deleted).toBe(true);

      expect(await storage.fileExists(key)).toBe(false);
      expect(await storage.readFile(key)).toBeNull();
    });

    it('returns null for non-existent files', async () => {
      const nonExistent = await storage.readFile('non_existent_key');
      expect(nonExistent).toBeNull();
      expect(await storage.fileExists('non_existent_key')).toBe(false);
    });
  });

  describe('IndexedDbFileStorage', () => {
    let db: IndexedDbDatabase;
    let storage: IndexedDbFileStorage;

    beforeEach(async () => {
      db = new IndexedDbDatabase(`test_file_db_${Date.now()}`);
      storage = new IndexedDbFileStorage(db);
      await storage.open();
    });

    afterEach(async () => {
      await storage.close();
    });

    it('stores and reads blobs in IndexedDB file_blobs store', async () => {
      const text = 'WorkBench Persistent File Content';
      const blob = new Blob([text], { type: 'text/markdown' });
      const key = 'file_idb_key_1';

      await storage.saveFile(key, blob, 'text/markdown');

      expect(await storage.fileExists(key)).toBe(true);

      const retrieved = await storage.readFile(key);
      expect(retrieved).not.toBeNull();
      expect(retrieved?.type).toBe('text/markdown');
      expect(await retrieved?.text()).toBe(text);
    });

    it('deletes blobs from IndexedDB file_blobs store', async () => {
      const key = 'file_idb_to_delete';
      await storage.saveFile(key, new Uint8Array([10, 20, 30]));

      expect(await storage.fileExists(key)).toBe(true);
      await storage.deleteFile(key);
      expect(await storage.fileExists(key)).toBe(false);
      expect(await storage.readFile(key)).toBeNull();
    });
  });
});
