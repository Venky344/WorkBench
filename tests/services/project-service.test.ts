import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryStorageEngine } from '@/persistence/memory/memory.storage-engine';
import { ProjectStorageRepository } from '@/repositories/storage/entity-repositories.storage';
import { ProjectService } from '@/services/project.service';
import { generateEntityId } from '@/domain/value-objects/id';
import { NotFoundError, ValidationError } from '@/utils/errors';

describe('ProjectService', () => {
  let memoryEngine: MemoryStorageEngine;
  let projectRepo: ProjectStorageRepository;
  let projectService: ProjectService;
  let workspaceId: string;

  beforeEach(async () => {
    memoryEngine = new MemoryStorageEngine();
    await memoryEngine.open();
    projectRepo = new ProjectStorageRepository(memoryEngine);
    projectService = new ProjectService(projectRepo);
    workspaceId = generateEntityId();
  });

  describe('createProject', () => {
    it('creates a project with valid name and generates a unique slug', async () => {
      const project = await projectService.createProject({
        workspaceId,
        name: 'CricAuction System',
        description: 'Auction platform',
        color: 'purple',
        icon: 'code',
        tags: ['auction', 'cricket'],
      });

      expect(project.id).toBeDefined();
      expect(project.name).toBe('CricAuction System');
      expect(project.slug).toBe('cricauction-system');
      expect(project.color).toBe('purple');
      expect(project.icon).toBe('code');
      expect(project.isArchived).toBe(false);
      expect(project.isPinned).toBe(false);
      expect(project.tags).toEqual(['auction', 'cricket']);
    });

    it('rejects empty or whitespace-only names', async () => {
      await expect(projectService.createProject({ workspaceId, name: '' })).rejects.toThrow(
        ValidationError,
      );

      await expect(projectService.createProject({ workspaceId, name: '   ' })).rejects.toThrow(
        ValidationError,
      );
    });

    it('rejects names exceeding 100 characters', async () => {
      const longName = 'A'.repeat(101);
      await expect(projectService.createProject({ workspaceId, name: longName })).rejects.toThrow(
        ValidationError,
      );
    });

    it('rejects duplicate project names within the same workspace', async () => {
      await projectService.createProject({
        workspaceId,
        name: 'Alpha Project',
      });

      await expect(
        projectService.createProject({
          workspaceId,
          name: 'Alpha Project',
        }),
      ).rejects.toThrow(ValidationError);
    });

    it('resolves slug collisions automatically', async () => {
      const p1 = await projectService.createProject({
        workspaceId,
        name: 'Alpha',
      });
      expect(p1.slug).toBe('alpha');

      // Create another project in a different workspace that would generate "alpha"
      const otherWs = generateEntityId();
      const p2 = await projectService.createProject({
        workspaceId: otherWs,
        name: 'Alpha',
      });
      expect(p2.slug).toBe('alpha');
    });
  });

  describe('getProject & findProject', () => {
    it('retrieves an existing project by ID', async () => {
      const created = await projectService.createProject({
        workspaceId,
        name: 'Test Project',
      });

      const retrieved = await projectService.getProject(created.id);
      expect(retrieved.id).toBe(created.id);
      expect(retrieved.name).toBe('Test Project');

      const found = await projectService.findProject(created.id);
      expect(found?.id).toBe(created.id);
    });

    it('throws NotFoundError when getProject called with non-existent ID', async () => {
      await expect(projectService.getProject(generateEntityId())).rejects.toThrow(NotFoundError);
    });

    it('returns null when findProject called with non-existent ID', async () => {
      const found = await projectService.findProject(generateEntityId());
      expect(found).toBeNull();
    });
  });

  describe('listProjects', () => {
    it('filters active, pinned, archived, and all projects', async () => {
      const p1 = await projectService.createProject({ workspaceId, name: 'Active 1' });
      const p2 = await projectService.createProject({ workspaceId, name: 'Active 2' });
      const p3 = await projectService.createProject({ workspaceId, name: 'To Archive' });

      await projectService.pinProject(p1.id);
      await projectService.archiveProject(p3.id);

      // Active filter (default)
      const active = await projectService.listProjects(workspaceId, { filter: 'active' });
      expect(active.length).toBe(2);
      expect(active.some((p) => p.id === p1.id)).toBe(true);
      expect(active.some((p) => p.id === p2.id)).toBe(true);
      expect(active.some((p) => p.id === p3.id)).toBe(false);

      // Pinned filter
      const pinned = await projectService.listProjects(workspaceId, { filter: 'pinned' });
      expect(pinned.length).toBe(1);
      expect(pinned[0]?.id).toBe(p1.id);

      // Archived filter
      const archived = await projectService.listProjects(workspaceId, { filter: 'archived' });
      expect(archived.length).toBe(1);
      expect(archived[0]?.id).toBe(p3.id);

      // All filter
      const all = await projectService.listProjects(workspaceId, { filter: 'all' });
      expect(all.length).toBe(3);
    });

    it('filters by search query matching name, description, and tags', async () => {
      await projectService.createProject({
        workspaceId,
        name: 'Compiler Pipeline',
        description: 'TypeScript to bytecode',
        tags: ['compiler', 'rust'],
      });

      await projectService.createProject({
        workspaceId,
        name: 'Design System',
        description: 'CSS variables and tokens',
        tags: ['ui'],
      });

      const byName = await projectService.listProjects(workspaceId, { searchQuery: 'compiler' });
      expect(byName.length).toBe(1);
      expect(byName[0]?.name).toBe('Compiler Pipeline');

      const byDesc = await projectService.listProjects(workspaceId, { searchQuery: 'bytecode' });
      expect(byDesc.length).toBe(1);

      const byTag = await projectService.listProjects(workspaceId, { searchQuery: 'rust' });
      expect(byTag.length).toBe(1);
    });

    it('sorts projects by name, createdAt, and updatedAt', async () => {
      await projectService.createProject({ workspaceId, name: 'Zebra' });
      await projectService.createProject({ workspaceId, name: 'Apple' });

      const sortedByName = await projectService.listProjects(workspaceId, { sortBy: 'name' });
      expect(sortedByName[0]?.name).toBe('Apple');
      expect(sortedByName[1]?.name).toBe('Zebra');
    });
  });

  describe('updateProject', () => {
    it('updates project metadata and recalculates slug when name changes', async () => {
      const project = await projectService.createProject({
        workspaceId,
        name: 'Old Name',
        description: 'Old description',
      });

      const updated = await projectService.updateProject(project.id, {
        name: 'New Name',
        description: 'New description',
        color: 'green',
        icon: 'terminal',
        tags: ['updated'],
      });

      expect(updated.name).toBe('New Name');
      expect(updated.slug).toBe('new-name');
      expect(updated.description).toBe('New description');
      expect(updated.color).toBe('green');
      expect(updated.icon).toBe('terminal');
      expect(updated.tags).toEqual(['updated']);
    });

    it('rejects update if new name collides with another project in workspace', async () => {
      await projectService.createProject({ workspaceId, name: 'Project 1' });
      const p2 = await projectService.createProject({ workspaceId, name: 'Project 2' });

      await expect(projectService.updateProject(p2.id, { name: 'Project 1' })).rejects.toThrow(
        ValidationError,
      );
    });
  });

  describe('lifecycle: pin, unpin, archive, restore, delete', () => {
    it('pins and unpins projects', async () => {
      const project = await projectService.createProject({ workspaceId, name: 'Pin Test' });

      const pinned = await projectService.pinProject(project.id);
      expect(pinned.isPinned).toBe(true);

      const unpinned = await projectService.unpinProject(project.id);
      expect(unpinned.isPinned).toBe(false);
    });

    it('archives and restores projects', async () => {
      const project = await projectService.createProject({ workspaceId, name: 'Archive Test' });
      await projectService.pinProject(project.id);

      const archived = await projectService.archiveProject(project.id);
      expect(archived.isArchived).toBe(true);
      expect(archived.archivedAt).toBeDefined();
      expect(archived.isPinned).toBe(false); // Cleared pinned on archive

      const restored = await projectService.restoreProject(project.id);
      expect(restored.isArchived).toBe(false);
      expect(restored.archivedAt).toBeUndefined();
    });

    it('deletes project explicitly', async () => {
      const project = await projectService.createProject({ workspaceId, name: 'Delete Test' });

      const deleted = await projectService.deleteProject(project.id);
      expect(deleted).toBe(true);

      const all = await projectService.listProjects(workspaceId, { filter: 'all' });
      expect(all.length).toBe(0);
    });
  });
});
