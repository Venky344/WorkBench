import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { IndexedDbDatabase } from '@/persistence/indexeddb/indexeddb.database';
import { IndexedDbStorageEngine } from '@/persistence/indexeddb/indexeddb.storage-engine';
import { STORES } from '@/persistence/schema';
import { Project, Task } from '@/domain/entities';
import { generateEntityId } from '@/domain/value-objects/id';
import { createCurrentTimestamp } from '@/domain/value-objects/timestamp';

describe('IndexedDB Persistence Adapter', () => {
  let dbName: string;
  let dbManager: IndexedDbDatabase;
  let engine: IndexedDbStorageEngine;

  beforeEach(async () => {
    dbName = `workbench_test_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    dbManager = new IndexedDbDatabase(dbName, 1);
    engine = new IndexedDbStorageEngine(dbManager);
    await engine.open();
  });

  afterEach(async () => {
    if (engine.isOpen()) {
      await engine.close();
    }
  });

  it('opens database and confirms connection status', () => {
    expect(engine.isOpen()).toBe(true);
  });

  it('puts and gets a project record', async () => {
    const project: Project = {
      id: generateEntityId(),
      workspaceId: generateEntityId(),
      name: 'IndexedDB Test Project',
      slug: 'indexeddb-test-project',
      isArchived: false,
      isPinned: false,
      order: 1,
      tags: ['test', 'db'],
      createdAt: createCurrentTimestamp(),
      updatedAt: createCurrentTimestamp(),
    };

    const saved = await engine.put(STORES.PROJECTS, project);
    expect(saved.id).toBe(project.id);

    const retrieved = await engine.get<Project>(STORES.PROJECTS, project.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.name).toBe('IndexedDB Test Project');
    expect(retrieved?.slug).toBe('indexeddb-test-project');
  });

  it('returns null for non-existent record', async () => {
    const item = await engine.get<Project>(STORES.PROJECTS, generateEntityId());
    expect(item).toBeNull();
  });

  it('fetches all records from a store', async () => {
    const workspaceId = generateEntityId();
    const p1: Project = {
      id: generateEntityId(),
      workspaceId,
      name: 'P1',
      slug: 'p1',
      isArchived: false,
      isPinned: false,
      order: 0,
      tags: [],
      createdAt: createCurrentTimestamp(),
      updatedAt: createCurrentTimestamp(),
    };
    const p2: Project = {
      id: generateEntityId(),
      workspaceId,
      name: 'P2',
      slug: 'p2',
      isArchived: false,
      isPinned: false,
      order: 1,
      tags: [],
      createdAt: createCurrentTimestamp(),
      updatedAt: createCurrentTimestamp(),
    };

    await engine.put(STORES.PROJECTS, p1);
    await engine.put(STORES.PROJECTS, p2);

    const all = await engine.getAll<Project>(STORES.PROJECTS);
    expect(all.length).toBe(2);
  });

  it('queries records using secondary indexes and predicates', async () => {
    const workspaceId = generateEntityId();
    const projectId = generateEntityId();
    const now = createCurrentTimestamp();

    const t1: Task = {
      id: generateEntityId(),
      workspaceId,
      projectId,
      title: 'Task 1',
      status: 'todo',
      priority: 'high',
      order: 0,
      tags: [],
      createdAt: now,
      updatedAt: now,
    };
    const t2: Task = {
      id: generateEntityId(),
      workspaceId,
      projectId,
      title: 'Task 2',
      status: 'done',
      priority: 'low',
      order: 1,
      tags: [],
      createdAt: now,
      updatedAt: now,
    };

    await engine.putBatch(STORES.TASKS, [t1, t2]);

    // Query by indexed field
    const todoTasks = await engine.find<Task>(STORES.TASKS, {
      indexName: 'by_status',
      indexValue: 'todo',
    });
    expect(todoTasks.length).toBe(1);
    expect(todoTasks[0]?.title).toBe('Task 1');

    // Query with predicate
    const highPriority = await engine.find<Task>(STORES.TASKS, {
      predicate: (t) => t.priority === 'high',
    });
    expect(highPriority.length).toBe(1);
    expect(highPriority[0]?.id).toBe(t1.id);
  });

  it('deletes records and counts store size', async () => {
    const id = generateEntityId();
    const project: Project = {
      id,
      workspaceId: generateEntityId(),
      name: 'To Delete',
      slug: 'to-delete',
      isArchived: false,
      isPinned: false,
      order: 0,
      tags: [],
      createdAt: createCurrentTimestamp(),
      updatedAt: createCurrentTimestamp(),
    };

    await engine.put(STORES.PROJECTS, project);
    expect(await engine.count(STORES.PROJECTS)).toBe(1);

    const deleted = await engine.delete(STORES.PROJECTS, id);
    expect(deleted).toBe(true);
    expect(await engine.count(STORES.PROJECTS)).toBe(0);

    const deletedAgain = await engine.delete(STORES.PROJECTS, id);
    expect(deletedAgain).toBe(false);
  });

  it('persists data after closing and reopening database', async () => {
    const project: Project = {
      id: generateEntityId(),
      workspaceId: generateEntityId(),
      name: 'Persistent Project',
      slug: 'persistent-project',
      isArchived: false,
      isPinned: false,
      order: 0,
      tags: [],
      createdAt: createCurrentTimestamp(),
      updatedAt: createCurrentTimestamp(),
    };

    await engine.put(STORES.PROJECTS, project);
    await engine.close();

    // Reopen with new engine instance pointing to the same dbName
    const reopenedManager = new IndexedDbDatabase(dbName, 1);
    const reopenedEngine = new IndexedDbStorageEngine(reopenedManager);
    await reopenedEngine.open();

    const retrieved = await reopenedEngine.get<Project>(STORES.PROJECTS, project.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.name).toBe('Persistent Project');

    await reopenedEngine.close();
  });
});
