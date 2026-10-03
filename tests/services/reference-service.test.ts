import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryStorageEngine } from '@/persistence/memory/memory.storage-engine';
import { StorageService } from '@/services/storage.service';
import { ReferenceService } from '@/services/reference.service';
import { WorkspaceService } from '@/services/workspace.service';
import { ProjectService } from '@/services/project.service';
import { EntityId } from '@/types';

describe('ReferenceService', () => {
  let storageEngine: MemoryStorageEngine;
  let storageService: StorageService;
  let referenceService: ReferenceService;
  let workspaceService: WorkspaceService;
  let projectService: ProjectService;
  let workspaceId: EntityId;
  let projectId: EntityId;

  beforeEach(async () => {
    storageEngine = new MemoryStorageEngine();
    storageService = new StorageService(storageEngine);
    await storageService.initialize();

    workspaceService = new WorkspaceService(storageService.workspaces, storageService.users);
    projectService = new ProjectService(storageService.projects);
    referenceService = new ReferenceService(storageService.references);

    const { workspace } = await workspaceService.getOrCreateDefaultWorkspace();
    workspaceId = workspace.id;

    const project = await projectService.createProject({
      workspaceId,
      name: 'Reference Test',
    });
    projectId = project.id;
  });

  it('creates, retrieves, updates, and deletes references', async () => {
    const reference = await referenceService.createReference({
      workspaceId,
      projectId,
      title: 'Attention Is All You Need',
      referenceKind: 'citation',
      targetUri: 'arxiv:1706.03762',
      annotation: 'Foundational paper for Transformer architecture',
      tags: ['nlp', 'transformers'],
    });

    expect(reference.id).toBeDefined();
    expect(reference.title).toBe('Attention Is All You Need');
    expect(reference.referenceKind).toBe('citation');
    expect(reference.targetUri).toBe('arxiv:1706.03762');

    const retrieved = await referenceService.getReferenceOrThrow(reference.id, projectId);
    expect(retrieved.id).toBe(reference.id);

    const updated = await referenceService.updateReference(
      reference.id,
      {
        title: 'Attention Is All You Need (Vaswani et al.)',
      },
      projectId,
    );
    expect(updated.title).toBe('Attention Is All You Need (Vaswani et al.)');

    const deleted = await referenceService.deleteReference(reference.id, projectId);
    expect(deleted).toBe(true);
    expect(await referenceService.getReference(reference.id)).toBeNull();
  });
});
