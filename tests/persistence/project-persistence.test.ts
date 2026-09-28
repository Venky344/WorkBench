import 'fake-indexeddb/auto';
import { describe, it, expect } from 'vitest';
import { createServiceContainer } from '@/services/container';
import { IndexedDbDatabase } from '@/persistence/indexeddb/indexeddb.database';
import { IndexedDbStorageEngine } from '@/persistence/indexeddb/indexeddb.storage-engine';

describe('Project Persistence across Sessions (Simulating Refresh)', () => {
  it('creates a project, closes database, re-opens, and verifies data survives', async () => {
    const dbName = `workbench_session_${Date.now()}`;

    // Session 1: Create project in IndexedDB
    const dbManager1 = new IndexedDbDatabase(dbName, 1);
    const engine1 = new IndexedDbStorageEngine(dbManager1);
    const services1 = createServiceContainer(engine1);

    const { workspace } = await services1.initialize();
    const createdProject = await services1.projectService.createProject({
      workspaceId: workspace.id,
      name: 'Persistent Across Refresh',
      description: 'Verifying IndexedDB durability',
      color: 'green',
      icon: 'database',
      tags: ['indexeddb', 'durability'],
    });

    expect(createdProject.id).toBeDefined();

    // Close session 1
    await services1.storageService.close();

    // Session 2: Open with new instance pointing to same DB (simulating browser page refresh)
    const dbManager2 = new IndexedDbDatabase(dbName, 1);
    const engine2 = new IndexedDbStorageEngine(dbManager2);
    const services2 = createServiceContainer(engine2);

    await services2.initialize();
    const retrieved = await services2.projectService.getProject(createdProject.id);

    expect(retrieved).not.toBeNull();
    expect(retrieved.name).toBe('Persistent Across Refresh');
    expect(retrieved.slug).toBe('persistent-across-refresh');
    expect(retrieved.description).toBe('Verifying IndexedDB durability');
    expect(retrieved.color).toBe('green');
    expect(retrieved.icon).toBe('database');
    expect(retrieved.tags).toEqual(['indexeddb', 'durability']);

    await services2.storageService.close();
  });
});
