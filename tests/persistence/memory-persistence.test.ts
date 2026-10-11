import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { IndexedDbDatabase } from '@/persistence/indexeddb/indexeddb.database';
import { IndexedDbStorageEngine } from '@/persistence/indexeddb/indexeddb.storage-engine';
import { defaultMigrationRunner } from '@/persistence/migrations';
import { WORKBENCH_DB_VERSION, STORES } from '@/persistence/schema';
import { MemoryStorageRepository } from '@/repositories/storage/entity-repositories.storage';
import { MemoryItem } from '@/domain/entities';
import { generateEntityId } from '@/domain/value-objects/id';
import { createCurrentTimestamp } from '@/domain/value-objects/timestamp';

describe('Memory Persistence and IndexedDB Store', () => {
  let dbName: string;
  let dbManager: IndexedDbDatabase;
  let storageEngine: IndexedDbStorageEngine;
  let memoryRepo: MemoryStorageRepository;

  beforeEach(async () => {
    dbName = `memory_test_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    dbManager = new IndexedDbDatabase(dbName, WORKBENCH_DB_VERSION, defaultMigrationRunner);
    await dbManager.open();

    storageEngine = new IndexedDbStorageEngine(dbManager);
    await storageEngine.open();

    memoryRepo = new MemoryStorageRepository(storageEngine);
  });

  afterEach(async () => {
    dbManager.close();
  });

  it('verifies v3 migration registers project_memories store and indexes', async () => {
    const rawDb = await dbManager.open();
    expect(rawDb.version).toBe(3);
    expect(rawDb.objectStoreNames.contains(STORES.PROJECT_MEMORIES)).toBe(true);
  });

  it('performs complete CRUD operations on project_memories store', async () => {
    const memId = generateEntityId();
    const wsId = generateEntityId();
    const projId = generateEntityId();
    const chatId = generateEntityId();
    const now = createCurrentTimestamp();

    const item: MemoryItem = {
      id: memId,
      entityType: 'memory',
      workspaceId: wsId,
      projectId: projId,
      title: 'Postgres Primary',
      content: 'Hosted on Aurora AWS Multi-AZ',
      type: 'fact',
      importance: 'high',
      status: 'active',
      reviewDate: '2026-11-15',
      tags: ['db', 'infra'],
      order: 0,
      sourceReferences: [
        {
          entityType: 'chat',
          entityId: chatId,
          title: 'DB Architecture Chat',
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    // Save
    const saved = await memoryRepo.save(item);
    expect(saved.id).toBe(memId);

    // Retrieve
    const retrieved = await memoryRepo.findById(memId);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.title).toBe('Postgres Primary');
    expect(retrieved?.sourceReferences).toHaveLength(1);
    expect(retrieved?.sourceReferences?.[0]?.title).toBe('DB Architecture Chat');

    // Update
    const updated = await memoryRepo.save({
      ...retrieved!,
      title: 'Postgres Primary (Aurora)',
      importance: 'critical',
      updatedAt: createCurrentTimestamp(),
    });
    expect(updated.importance).toBe('critical');

    // Delete
    const deleted = await memoryRepo.delete(memId);
    expect(deleted).toBe(true);

    const postDelete = await memoryRepo.findById(memId);
    expect(postDelete).toBeNull();
  });

  it('queries memories by project, workspace, type, status, and review date', async () => {
    const wsId = generateEntityId();
    const proj1 = generateEntityId();
    const proj2 = generateEntityId();
    const now = createCurrentTimestamp();

    const mem1Id = generateEntityId();
    const mem2Id = generateEntityId();
    const mem3Id = generateEntityId();

    const mem1: MemoryItem = {
      id: mem1Id,
      entityType: 'memory',
      workspaceId: wsId,
      projectId: proj1,
      title: 'Fact 1',
      content: 'Fact Content',
      type: 'fact',
      importance: 'high',
      status: 'active',
      reviewDate: '2026-01-01',
      tags: [],
      order: 0,
      createdAt: now,
      updatedAt: now,
    };

    const mem2: MemoryItem = {
      id: mem2Id,
      entityType: 'memory',
      workspaceId: wsId,
      projectId: proj1,
      title: 'Goal 1',
      content: 'Goal Content',
      type: 'goal',
      importance: 'critical',
      status: 'active',
      reviewDate: '2029-01-01',
      tags: [],
      order: 1,
      createdAt: now,
      updatedAt: now,
    };

    const mem3: MemoryItem = {
      id: mem3Id,
      entityType: 'memory',
      workspaceId: wsId,
      projectId: proj2,
      title: 'Other Proj Fact',
      content: 'Other Content',
      type: 'fact',
      importance: 'low',
      status: 'archived',
      tags: [],
      order: 0,
      createdAt: now,
      updatedAt: now,
    };

    await memoryRepo.save(mem1);
    await memoryRepo.save(mem2);
    await memoryRepo.save(mem3);

    const byProj1 = await memoryRepo.findByProjectId(proj1);
    expect(byProj1).toHaveLength(2);

    const byWs1 = await memoryRepo.findByWorkspaceId(wsId);
    expect(byWs1).toHaveLength(3);

    const byTypeFact = await memoryRepo.findByType(proj1, 'fact');
    expect(byTypeFact).toHaveLength(1);
    expect(byTypeFact[0]!.id).toBe(mem1Id);

    const byStatusActive = await memoryRepo.findByStatus(proj1, 'active');
    expect(byStatusActive).toHaveLength(2);

    const dueForReview = await memoryRepo.findDueForReview(proj1, '2026-06-01');
    expect(dueForReview).toHaveLength(1);
    expect(dueForReview[0]!.id).toBe(mem1Id);
  });

  it('persists memories across storage engine re-initialization', async () => {
    const memId = generateEntityId();
    const wsId = generateEntityId();
    const projId = generateEntityId();
    const now = createCurrentTimestamp();

    const item: MemoryItem = {
      id: memId,
      entityType: 'memory',
      workspaceId: wsId,
      projectId: projId,
      title: 'Permanent Guideline',
      content: 'Must persist after reboot',
      type: 'preference',
      importance: 'medium',
      status: 'active',
      tags: [],
      order: 0,
      createdAt: now,
      updatedAt: now,
    };

    await memoryRepo.save(item);
    dbManager.close();

    // Reopen with new storage manager pointing to the same DB name
    const newDbManager = new IndexedDbDatabase(
      dbName,
      WORKBENCH_DB_VERSION,
      defaultMigrationRunner,
    );
    const newStorageEngine = new IndexedDbStorageEngine(newDbManager);
    await newStorageEngine.open();
    const newMemoryRepo = new MemoryStorageRepository(newStorageEngine);

    const reloaded = await newMemoryRepo.findById(memId);
    expect(reloaded).not.toBeNull();
    expect(reloaded?.title).toBe('Permanent Guideline');

    newDbManager.close();
  });
});
