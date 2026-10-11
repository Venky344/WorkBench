import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryStorageEngine } from '@/persistence/memory/memory.storage-engine';
import { StorageService } from '@/services/storage.service';
import { MemoryService } from '@/services/memory.service';
import { WorkspaceService } from '@/services/workspace.service';
import { ProjectService } from '@/services/project.service';
import { ChatService } from '@/services/chat.service';
import { NoteService } from '@/services/note.service';
import { ReferenceService } from '@/services/reference.service';
import { TagService } from '@/services/tag.service';
import { isMemoryDueForReview } from '@/domain/memory';
import { EntityId } from '@/types';
import { NotFoundError, ValidationError } from '@/utils/errors';

describe('MemoryService', () => {
  let storageEngine: MemoryStorageEngine;
  let storageService: StorageService;
  let memoryService: MemoryService;
  let workspaceService: WorkspaceService;
  let projectService: ProjectService;
  let chatService: ChatService;
  let noteService: NoteService;
  let referenceService: ReferenceService;
  let tagService: TagService;

  let workspaceId: EntityId;
  let projectId: EntityId;

  beforeEach(async () => {
    storageEngine = new MemoryStorageEngine();
    storageService = new StorageService(storageEngine);
    await storageService.initialize();

    workspaceService = new WorkspaceService(storageService.workspaces, storageService.users);
    projectService = new ProjectService(storageService.projects);
    chatService = new ChatService(storageService.chats, storageService.messages);
    noteService = new NoteService(storageService.notes);
    referenceService = new ReferenceService(storageService.references);

    memoryService = new MemoryService(storageService.memories, {
      projectRepo: storageService.projects,
      chatRepo: storageService.chats,
      noteRepo: storageService.notes,
      fileRepo: storageService.files,
      linkRepo: storageService.links,
      bookmarkRepo: storageService.bookmarks,
      referenceRepo: storageService.references,
      snippetRepo: storageService.codeSnippets,
      taskRepo: storageService.tasks,
      decisionRepo: storageService.decisions,
    });

    tagService = new TagService(
      storageService.tags,
      storageService.projects,
      storageService.chats,
      storageService.files,
      storageService.notes,
      storageService.links,
      storageService.bookmarks,
      storageService.references,
      storageService.codeSnippets,
      storageService.tasks,
      storageService.decisions,
      storageService.memories,
    );

    const { workspace } = await workspaceService.getOrCreateDefaultWorkspace();
    workspaceId = workspace.id;

    const project = await projectService.createProject({
      workspaceId,
      name: 'Alpha Core Platform',
    });
    projectId = project.id;
  });

  describe('CRUD and Validation Lifecycle', () => {
    it('creates and retrieves a memory item with all fields', async () => {
      const memory = await memoryService.createMemory({
        workspaceId,
        projectId,
        title: 'Primary database is PostgreSQL 16',
        content: 'PostgreSQL 16 hosted on AWS Aurora Multi-AZ with pgvector enabled for Phase 14.',
        type: 'fact',
        importance: 'high',
        reviewDate: '2026-12-31',
        tags: ['infrastructure', 'database'],
      });

      expect(memory.id).toBeDefined();
      expect(memory.entityType).toBe('memory');
      expect(memory.title).toBe('Primary database is PostgreSQL 16');
      expect(memory.content).toContain('PostgreSQL 16');
      expect(memory.type).toBe('fact');
      expect(memory.importance).toBe('high');
      expect(memory.status).toBe('active');
      expect(memory.reviewDate).toBe('2026-12-31');
      expect(memory.tags).toEqual(['infrastructure', 'database']);
      expect(memory.createdAt).toBeDefined();
      expect(memory.updatedAt).toBeDefined();

      const retrieved = await memoryService.getMemoryOrThrow(memory.id, projectId);
      expect(retrieved.id).toBe(memory.id);
    });

    it('rejects creation with empty title or content', async () => {
      await expect(
        memoryService.createMemory({
          workspaceId,
          projectId,
          title: '',
          content: 'Some context',
          type: 'fact',
          importance: 'medium',
        }),
      ).rejects.toThrow(ValidationError);

      await expect(
        memoryService.createMemory({
          workspaceId,
          projectId,
          title: 'Title',
          content: '   ',
          type: 'fact',
          importance: 'medium',
        }),
      ).rejects.toThrow(ValidationError);
    });

    it('rejects creation with invalid type or importance', async () => {
      await expect(
        memoryService.createMemory({
          workspaceId,
          projectId,
          title: 'Title',
          content: 'Content',
          type: 'invalid_type' as unknown as import('@/domain/entities').MemoryType,
          importance: 'medium',
        }),
      ).rejects.toThrow(ValidationError);

      await expect(
        memoryService.createMemory({
          workspaceId,
          projectId,
          title: 'Title',
          content: 'Content',
          type: 'fact',
          importance: 'super_high' as unknown as import('@/domain/entities').MemoryImportance,
        }),
      ).rejects.toThrow(ValidationError);
    });

    it('updates memory item while preserving creation timestamp and immutable properties', async () => {
      const memory = await memoryService.createMemory({
        workspaceId,
        projectId,
        title: 'Initial Title',
        content: 'Initial Content',
        type: 'goal',
        importance: 'low',
      });

      const updated = await memoryService.updateMemory(
        memory.id,
        {
          title: 'Updated Goal Title',
          content: 'Updated Content Body',
          type: 'goal',
          importance: 'critical',
          reviewDate: '2027-01-01',
        },
        projectId,
      );

      expect(updated.id).toBe(memory.id);
      expect(updated.title).toBe('Updated Goal Title');
      expect(updated.content).toBe('Updated Content Body');
      expect(updated.importance).toBe('critical');
      expect(updated.reviewDate).toBe('2027-01-01');
      expect(updated.createdAt).toBe(memory.createdAt);
      expect(new Date(updated.updatedAt).getTime()).toBeGreaterThanOrEqual(
        new Date(memory.createdAt).getTime(),
      );
    });

    it('archives and restores memory items without deleting metadata', async () => {
      const memory = await memoryService.createMemory({
        workspaceId,
        projectId,
        title: 'Temporary Constraint',
        content: 'Frozen deployment until Q4 audit completes',
        type: 'constraint',
        importance: 'high',
      });

      expect(memory.status).toBe('active');

      const archived = await memoryService.archiveMemory(memory.id, projectId);
      expect(archived.status).toBe('archived');
      expect(archived.archivedAt).toBeDefined();

      const activeList = await memoryService.listActiveMemories(projectId);
      expect(activeList.some((m) => m.id === memory.id)).toBe(false);

      const allList = await memoryService.listMemoriesByProject(projectId);
      expect(allList.some((m) => m.id === memory.id)).toBe(true);

      const restored = await memoryService.restoreMemory(memory.id, projectId);
      expect(restored.status).toBe('active');
      expect(restored.archivedAt).toBeUndefined();

      const activeListAfter = await memoryService.listActiveMemories(projectId);
      expect(activeListAfter.some((m) => m.id === memory.id)).toBe(true);
    });

    it('deletes memory item permanently', async () => {
      const memory = await memoryService.createMemory({
        workspaceId,
        projectId,
        title: 'Obsolete Note',
        content: 'Discard me',
        type: 'note',
        importance: 'low',
      });

      const deleted = await memoryService.deleteMemory(memory.id, projectId);
      expect(deleted).toBe(true);

      const retrieved = await memoryService.getMemory(memory.id);
      expect(retrieved).toBeNull();

      await expect(memoryService.getMemoryOrThrow(memory.id, projectId)).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe('Filtering and Sorting', () => {
    beforeEach(async () => {
      await memoryService.createMemory({
        workspaceId,
        projectId,
        title: 'A Fact',
        content: 'Fact content',
        type: 'fact',
        importance: 'low',
        tags: ['arch'],
      });

      await memoryService.createMemory({
        workspaceId,
        projectId,
        title: 'B Critical Goal',
        content: 'Goal content',
        type: 'goal',
        importance: 'critical',
        tags: ['release'],
      });

      const archived = await memoryService.createMemory({
        workspaceId,
        projectId,
        title: 'C Archived Constraint',
        content: 'Old rule',
        type: 'constraint',
        importance: 'medium',
      });
      await memoryService.archiveMemory(archived.id, projectId);
    });

    it('filters by status, type, importance, and tags', async () => {
      const activeFacts = await memoryService.listMemoriesByProject(projectId, {
        status: 'active',
        type: 'fact',
      });
      expect(activeFacts).toHaveLength(1);
      expect(activeFacts[0]!.title).toBe('A Fact');

      const criticalItems = await memoryService.listMemoriesByProject(projectId, {
        importance: 'critical',
      });
      expect(criticalItems).toHaveLength(1);
      expect(criticalItems[0]!.title).toBe('B Critical Goal');

      const releaseTagged = await memoryService.listMemoriesByProject(projectId, {
        tags: ['release'],
      });
      expect(releaseTagged).toHaveLength(1);
      expect(releaseTagged[0]!.title).toBe('B Critical Goal');

      const archivedItems = await memoryService.listMemoriesByProject(projectId, {
        status: 'archived',
      });
      expect(archivedItems).toHaveLength(1);
      expect(archivedItems[0]!.title).toBe('C Archived Constraint');
    });

    it('sorts by importance, updated date, and title', async () => {
      const sortedByImportance = await memoryService.listMemoriesByProject(projectId, {
        sortBy: 'importance',
        sortOrder: 'desc',
        status: 'active',
      });

      expect(sortedByImportance[0]!.importance).toBe('critical');
      expect(sortedByImportance[1]!.importance).toBe('low');

      const sortedByTitle = await memoryService.listMemoriesByProject(projectId, {
        sortBy: 'title',
        sortOrder: 'asc',
      });
      expect(sortedByTitle[0]!.title).toBe('A Fact');
    });
  });

  describe('Source References and Provenance', () => {
    it('attaches explicit source references and resolves them with routes', async () => {
      const chat = await chatService.createChat({
        workspaceId,
        projectId,
        title: 'API Versioning Design Sync',
      });

      const note = await noteService.createNote({
        workspaceId,
        projectId,
        title: 'Contract Guidelines',
        content: 'All endpoints must follow REST JSON-API structure.',
      });

      const memory = await memoryService.createMemory({
        workspaceId,
        projectId,
        title: 'All API routes must be prefixed with /api/v1',
        content: 'Strict semantic versioning agreed during technical sync.',
        type: 'constraint',
        importance: 'high',
        sourceReferences: [
          {
            entityType: 'chat',
            entityId: chat.id,
            title: chat.title,
            excerpt: 'Agreed on /api/v1 prefix.',
          },
          {
            entityType: 'note',
            entityId: note.id,
            title: note.title,
          },
        ],
      });

      expect(memory.sourceReferences).toHaveLength(2);

      const resolved = await memoryService.resolveSourceEntities(memory);
      expect(resolved).toHaveLength(2);

      expect(resolved[0]!.entityType).toBe('chat');
      expect(resolved[0]!.exists).toBe(true);
      expect(resolved[0]!.route).toBe(`/projects/${projectId}/chats/${chat.id}`);

      expect(resolved[1]!.entityType).toBe('note');
      expect(resolved[1]!.exists).toBe(true);
      expect(resolved[1]!.route).toBe(`/projects/${projectId}/notes/${note.id}`);
    });

    it('handles deleted or unavailable source records gracefully without data loss', async () => {
      const chat = await chatService.createChat({
        workspaceId,
        projectId,
        title: 'Temporary Sync',
      });

      const memory = await memoryService.createMemory({
        workspaceId,
        projectId,
        title: 'Context item with soon-to-be deleted chat',
        content: 'Crucial requirement',
        type: 'fact',
        importance: 'medium',
        sourceReferences: [
          {
            entityType: 'chat',
            entityId: chat.id,
            title: chat.title,
          },
        ],
      });

      // Delete the chat entity
      await chatService.deleteChat(chat.id);

      // Memory must survive intact
      const retrieved = await memoryService.getMemoryOrThrow(memory.id, projectId);
      expect(retrieved.sourceReferences).toHaveLength(1);

      // Provenance resolver safely marks exists: false
      const resolved = await memoryService.resolveSourceEntities(retrieved);
      expect(resolved).toHaveLength(1);
      expect(resolved[0]!.exists).toBe(false);
      expect(resolved[0]!.route).toBeUndefined();
    });

    it('resolves reference entities with existing source record and resources route', async () => {
      const reference = await referenceService.createReference({
        workspaceId,
        projectId,
        title: 'IEEE 802.3 Spec Citation',
        sourceEntityType: 'note',
        sourceEntityId: 'some-note-id',
        referenceKind: 'citation',
        targetUri: 'https://standards.ieee.org',
      });

      const memory = await memoryService.createMemory({
        workspaceId,
        projectId,
        title: 'Network standard adherence',
        content: 'Ethernet compliance guaranteed by IEEE 802.3',
        type: 'constraint',
        importance: 'high',
        sourceReferences: [
          {
            entityType: 'reference',
            entityId: reference.id,
            title: reference.title,
          },
        ],
      });

      const resolved = await memoryService.resolveSourceEntities(memory);
      expect(resolved).toHaveLength(1);
      expect(resolved[0]!.entityType).toBe('reference');
      expect(resolved[0]!.exists).toBe(true);
      expect(resolved[0]!.title).toBe('IEEE 802.3 Spec Citation');
      expect(resolved[0]!.route).toBe(`/projects/${projectId}/resources`);
    });

    it('handles deleted or missing reference entities safely with exists: false', async () => {
      const reference = await referenceService.createReference({
        workspaceId,
        projectId,
        title: 'Draft RFC Citation',
        sourceEntityType: 'chat',
        sourceEntityId: 'some-chat-id',
        referenceKind: 'citation',
        targetUri: 'https://rfc-editor.org',
      });

      const memory = await memoryService.createMemory({
        workspaceId,
        projectId,
        title: 'Protocol requirement',
        content: 'Pending protocol standard RFC',
        type: 'fact',
        importance: 'medium',
        sourceReferences: [
          {
            entityType: 'reference',
            entityId: reference.id,
            title: reference.title,
          },
        ],
      });

      // Delete the reference entity
      await referenceService.deleteReference(reference.id);

      const retrieved = await memoryService.getMemoryOrThrow(memory.id, projectId);
      const resolved = await memoryService.resolveSourceEntities(retrieved);
      expect(resolved).toHaveLength(1);
      expect(resolved[0]!.entityType).toBe('reference');
      expect(resolved[0]!.exists).toBe(false);
      expect(resolved[0]!.route).toBeUndefined();
    });
  });

  describe('Date-Only Review Calculations', () => {
    it('evaluates a review date in the future as not due', () => {
      const isDue = isMemoryDueForReview('2026-10-12', '2026-10-11');
      expect(isDue).toBe(false);
    });

    it('evaluates a review date equal to today as due', () => {
      const isDue = isMemoryDueForReview('2026-10-11', '2026-10-11');
      expect(isDue).toBe(true);
    });

    it('evaluates a review date in the past as due', () => {
      const isDue = isMemoryDueForReview('2026-10-10', '2026-10-11');
      expect(isDue).toBe(true);

      const pastYearDue = isMemoryDueForReview('2025-12-31', '2026-10-11');
      expect(pastYearDue).toBe(true);
    });

    it('safely handles missing, null, undefined, and invalid review dates as not due', () => {
      expect(isMemoryDueForReview(undefined, '2026-10-11')).toBe(false);
      expect(isMemoryDueForReview(null, '2026-10-11')).toBe(false);
      expect(isMemoryDueForReview('', '2026-10-11')).toBe(false);
      expect(isMemoryDueForReview('   ', '2026-10-11')).toBe(false);
      expect(isMemoryDueForReview('invalid-date-string', '2026-10-11')).toBe(false);
    });

    it('ensures strict consistency between isDueForReview filter and getProjectMemoryContext', async () => {
      const todayStr = new Date().toISOString().split('T')[0]!;
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]!;
      const tomorrow = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]!;

      await memoryService.createMemory({
        workspaceId,
        projectId,
        title: 'Past Review Memory',
        content: 'Content 1',
        type: 'fact',
        importance: 'high',
        reviewDate: yesterday,
      });

      await memoryService.createMemory({
        workspaceId,
        projectId,
        title: 'Today Review Memory',
        content: 'Content 2',
        type: 'goal',
        importance: 'critical',
        reviewDate: todayStr,
      });

      await memoryService.createMemory({
        workspaceId,
        projectId,
        title: 'Future Review Memory',
        content: 'Content 3',
        type: 'constraint',
        importance: 'low',
        reviewDate: tomorrow,
      });

      await memoryService.createMemory({
        workspaceId,
        projectId,
        title: 'No Review Date Memory',
        content: 'Content 4',
        type: 'note',
        importance: 'medium',
      });

      const dueFilterResults = await memoryService.listMemoriesByProject(projectId, {
        isDueForReview: true,
      });

      const context = await memoryService.getProjectMemoryContext(projectId);

      expect(dueFilterResults).toHaveLength(2);
      expect(context.reviewDueCount).toBe(2);
      expect(context.dueForReview).toHaveLength(2);
      expect(context.counts.dueForReview).toBe(2);

      const filterIds = new Set(dueFilterResults.map((m) => m.id));
      const contextIds = new Set(context.dueForReview.map((m) => m.id));
      expect(filterIds).toEqual(contextIds);
    });

    it('ensures date-only parsing is independent of machine local timezone', () => {
      // Oct 11 2026 review date relative to Oct 10 2026 (Tomorrow)
      expect(isMemoryDueForReview('2026-10-11', '2026-10-10')).toBe(false);

      // Oct 11 2026 review date relative to Oct 11 2026 (Today)
      expect(isMemoryDueForReview('2026-10-11', '2026-10-11')).toBe(true);

      // Oct 11 2026 review date relative to Oct 12 2026 (Yesterday)
      expect(isMemoryDueForReview('2026-10-11', '2026-10-12')).toBe(true);
    });
  });

  describe('Memory Context Assembly (getProjectMemoryContext)', () => {
    it('assembles structured project memory context with grouping and metrics', async () => {
      await memoryService.createMemory({
        workspaceId,
        projectId,
        title: 'Fact 1',
        content: 'Fact text',
        type: 'fact',
        importance: 'high',
      });

      await memoryService.createMemory({
        workspaceId,
        projectId,
        title: 'Goal 1',
        content: 'Goal text',
        type: 'goal',
        importance: 'critical',
      });

      await memoryService.createMemory({
        workspaceId,
        projectId,
        title: 'Constraint 1',
        content: 'Constraint text',
        type: 'constraint',
        importance: 'medium',
        reviewDate: '2020-01-01', // Past date -> due for review
      });

      const archived = await memoryService.createMemory({
        workspaceId,
        projectId,
        title: 'Old Preference',
        content: 'Old text',
        type: 'preference',
        importance: 'low',
      });
      await memoryService.archiveMemory(archived.id, projectId);

      const context = await memoryService.getProjectMemoryContext(projectId);

      expect(context.projectId).toBe(projectId);
      expect(context.workspaceId).toBe(workspaceId);
      expect(context.projectName).toBe('Alpha Core Platform');
      expect(context.totalActiveCount).toBe(3);
      expect(context.totalArchivedCount).toBe(1);
      expect(context.reviewDueCount).toBe(1);
      expect(context.highImportanceCount).toBe(2); // critical (Goal 1) + high (Fact 1)

      expect(context.byType.fact).toHaveLength(1);
      expect(context.byType.goal).toHaveLength(1);
      expect(context.byType.constraint).toHaveLength(1);
      expect(context.byType.preference).toHaveLength(0); // Archived excluded from active context

      expect(context.reviewDueItems).toHaveLength(1);
      expect(context.reviewDueItems![0]!.title).toBe('Constraint 1');
    });

    it('rejects context assembly for nonexistent project', async () => {
      await expect(memoryService.getProjectMemoryContext('nonexistent-proj-id')).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe('Workspace Isolation and Security Boundaries', () => {
    it('prevents accessing or modifying memories belonging to a different project or workspace', async () => {
      const otherProject = await projectService.createProject({
        workspaceId,
        name: 'Other Project',
      });

      const memoryInAlpha = await memoryService.createMemory({
        workspaceId,
        projectId,
        title: 'Alpha Secret',
        content: 'Secret content',
        type: 'fact',
        importance: 'critical',
      });

      // Trying to get or update with wrong projectId
      await expect(
        memoryService.getMemoryOrThrow(memoryInAlpha.id, otherProject.id),
      ).rejects.toThrow(NotFoundError);

      await expect(
        memoryService.updateMemory(memoryInAlpha.id, { title: 'Hacked Title' }, otherProject.id),
      ).rejects.toThrow(NotFoundError);

      await expect(memoryService.archiveMemory(memoryInAlpha.id, otherProject.id)).rejects.toThrow(
        NotFoundError,
      );

      await expect(memoryService.deleteMemory(memoryInAlpha.id, otherProject.id)).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe('Tag Integration and Cascade Cleanup', () => {
    it('cleans up memory tag assignments when a tag is deleted', async () => {
      const tag = await tagService.createTag({
        workspaceId,
        name: 'compliance-v1',
      });

      const memory = await memoryService.createMemory({
        workspaceId,
        projectId,
        title: 'SOC2 Type II Compliance',
        content: 'All logs must be retained for 365 days.',
        type: 'constraint',
        importance: 'critical',
        tags: [tag.id],
      });

      const usage = await tagService.getTagUsageCount(workspaceId, tag.id);
      expect(usage.memoryCount).toBe(1);
      expect(usage.totalCount).toBeGreaterThanOrEqual(1);

      // Delete the tag
      await tagService.deleteTag(tag.id);

      // Tag must be removed from the memory item
      const updatedMemory = await memoryService.getMemoryOrThrow(memory.id, projectId);
      expect(updatedMemory.tags).toEqual([]);
    });
  });
});
