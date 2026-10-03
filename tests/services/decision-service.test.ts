import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryStorageEngine } from '@/persistence/memory/memory.storage-engine';
import { StorageService } from '@/services/storage.service';
import { DecisionService } from '@/services/decision.service';
import { WorkspaceService } from '@/services/workspace.service';
import { ProjectService } from '@/services/project.service';
import { EntityId } from '@/types';
import { NotFoundError, ValidationError } from '@/utils/errors';

describe('DecisionService', () => {
  let storageEngine: MemoryStorageEngine;
  let storageService: StorageService;
  let decisionService: DecisionService;
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
    decisionService = new DecisionService(storageService.decisions);

    const { workspace } = await workspaceService.getOrCreateDefaultWorkspace();
    workspaceId = workspace.id;

    const project = await projectService.createProject({
      workspaceId,
      name: 'Architecture Project',
    });
    projectId = project.id;
  });

  describe('CRUD operations', () => {
    it('creates and retrieves a persistent decision record', async () => {
      const decision = await decisionService.createDecision({
        workspaceId,
        projectId,
        title: 'Adopt Vitest for Unit Testing',
        decision: 'Use Vitest as the sole runner for fast in-memory execution.',
        rationale: 'Vitest shares Vite configuration and has native ESM and TS support.',
        implications: 'Test suites must follow Vitest conventions.',
        status: 'accepted',
        tags: ['arch', 'testing'],
      });

      expect(decision.id).toBeDefined();
      expect(decision.title).toBe('Adopt Vitest for Unit Testing');
      expect(decision.decision).toBe('Use Vitest as the sole runner for fast in-memory execution.');
      expect(decision.rationale).toContain('native ESM');
      expect(decision.implications).toBe('Test suites must follow Vitest conventions.');
      expect(decision.status).toBe('accepted');
      expect(decision.tags).toEqual(['arch', 'testing']);

      const retrieved = await decisionService.getDecisionOrThrow(decision.id, projectId);
      expect(retrieved.id).toBe(decision.id);
      expect(retrieved.title).toBe(decision.title);
    });

    it('updates decision fields and status', async () => {
      const decision = await decisionService.createDecision({
        workspaceId,
        projectId,
        title: 'Temporary Approach',
        decision: 'Use localStorage initially.',
        rationale: 'Fast to prototype.',
      });

      const updated = await decisionService.updateDecision(
        decision.id,
        {
          title: 'Superseded LocalStorage Approach',
          decision: 'Migrated to IndexedDB with Memory fallback.',
          rationale: 'LocalStorage has a 5MB limit.',
          implications: 'Async storage engine required.',
          status: 'superseded',
          tags: ['storage', 'migration'],
        },
        projectId,
      );

      expect(updated.title).toBe('Superseded LocalStorage Approach');
      expect(updated.decision).toBe('Migrated to IndexedDB with Memory fallback.');
      expect(updated.status).toBe('superseded');
      expect(updated.implications).toBe('Async storage engine required.');
      expect(updated.tags).toEqual(['storage', 'migration']);
    });

    it('preserves decision text, rationale, and implications across all status transitions', async () => {
      const decision = await decisionService.createDecision({
        workspaceId,
        projectId,
        title: 'Status Transition Invariant Test',
        decision: 'Use WebSockets for real-time live auction feed.',
        rationale: 'Long-polling latency was excessive.',
        implications: 'Requires persistent connection management.',
        status: 'proposed',
      });

      // proposed -> accepted
      const accepted = await decisionService.updateDecision(
        decision.id,
        { status: 'accepted' },
        projectId,
      );
      expect(accepted.status).toBe('accepted');
      expect(accepted.decision).toBe('Use WebSockets for real-time live auction feed.');
      expect(accepted.rationale).toBe('Long-polling latency was excessive.');
      expect(accepted.implications).toBe('Requires persistent connection management.');

      // accepted -> superseded
      const superseded = await decisionService.updateDecision(
        decision.id,
        { status: 'superseded' },
        projectId,
      );
      expect(superseded.status).toBe('superseded');
      expect(superseded.decision).toBe('Use WebSockets for real-time live auction feed.');

      // superseded -> rejected
      const rejected = await decisionService.updateDecision(
        decision.id,
        { status: 'rejected' },
        projectId,
      );
      expect(rejected.status).toBe('rejected');
      expect(rejected.decision).toBe('Use WebSockets for real-time live auction feed.');
      expect(rejected.rationale).toBe('Long-polling latency was excessive.');
    });

    it('deletes a decision record', async () => {
      const decision = await decisionService.createDecision({
        workspaceId,
        projectId,
        title: 'Draft Decision',
        decision: 'Draft decision content',
        rationale: 'Draft rationale',
      });

      const deleted = await decisionService.deleteDecision(decision.id, projectId);
      expect(deleted).toBe(true);

      const found = await decisionService.getDecision(decision.id);
      expect(found).toBeNull();
      await expect(decisionService.getDecisionOrThrow(decision.id)).rejects.toThrow(NotFoundError);
    });
  });

  describe('Filtering and Listing', () => {
    it('lists and filters decisions by project, status, and tags', async () => {
      await decisionService.createDecision({
        workspaceId,
        projectId,
        title: 'Decision 1',
        decision: 'Dec 1',
        rationale: 'Rat 1',
        status: 'accepted',
        tags: ['backend'],
      });

      await decisionService.createDecision({
        workspaceId,
        projectId,
        title: 'Decision 2',
        decision: 'Dec 2',
        rationale: 'Rat 2',
        status: 'proposed',
        tags: ['frontend'],
      });

      await decisionService.createDecision({
        workspaceId,
        projectId,
        title: 'Decision 3',
        decision: 'Dec 3',
        rationale: 'Rat 3',
        status: 'accepted',
        tags: ['frontend', 'backend'],
      });

      const allDecisions = await decisionService.listDecisionsByProject(projectId);
      expect(allDecisions.length).toBe(3);

      const acceptedDecisions = await decisionService.listDecisionsByProject(projectId, {
        status: 'accepted',
      });
      expect(acceptedDecisions.length).toBe(2);

      const frontendDecisions = await decisionService.listDecisionsByProject(projectId, {
        tagId: 'frontend',
      });
      expect(frontendDecisions.length).toBe(2);
    });

    it('lists decisions across workspace', async () => {
      const otherProject = await projectService.createProject({
        workspaceId,
        name: 'Project 2',
      });

      await decisionService.createDecision({
        workspaceId,
        projectId,
        title: 'Decision in Project 1',
        decision: 'D1',
        rationale: 'R1',
      });

      await decisionService.createDecision({
        workspaceId,
        projectId: otherProject.id,
        title: 'Decision in Project 2',
        decision: 'D2',
        rationale: 'R2',
      });

      const workspaceDecisions = await decisionService.listDecisionsByWorkspace(workspaceId);
      expect(workspaceDecisions.length).toBe(2);
    });
  });

  describe('Isolation and Validation', () => {
    it('enforces project isolation on decision operations', async () => {
      const otherProject = await projectService.createProject({
        workspaceId,
        name: 'Unrelated Project',
      });

      const decision = await decisionService.createDecision({
        workspaceId,
        projectId,
        title: 'Protected Decision',
        decision: 'Protected decision',
        rationale: 'Protected rationale',
      });

      await expect(
        decisionService.getDecisionOrThrow(decision.id, otherProject.id),
      ).rejects.toThrow(ValidationError);
      await expect(
        decisionService.updateDecision(decision.id, { title: 'Changed' }, otherProject.id),
      ).rejects.toThrow(ValidationError);
      await expect(decisionService.deleteDecision(decision.id, otherProject.id)).rejects.toThrow(
        ValidationError,
      );
    });

    it('rejects empty title, decision, or rationale', async () => {
      await expect(
        decisionService.createDecision({
          workspaceId,
          projectId,
          title: '',
          decision: 'Dec',
          rationale: 'Rat',
        }),
      ).rejects.toThrow(ValidationError);

      await expect(
        decisionService.createDecision({
          workspaceId,
          projectId,
          title: 'Title',
          decision: '   ',
          rationale: 'Rat',
        }),
      ).rejects.toThrow(ValidationError);

      await expect(
        decisionService.createDecision({
          workspaceId,
          projectId,
          title: 'Title',
          decision: 'Dec',
          rationale: '',
        }),
      ).rejects.toThrow(ValidationError);
    });
  });
});
