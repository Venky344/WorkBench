import { describe, it, expect, beforeEach } from 'vitest';
import { TagService } from '@/services/tag.service';
import { ProjectService } from '@/services/project.service';
import { ChatService } from '@/services/chat.service';
import { MemoryStorageEngine } from '@/persistence/memory/memory.storage-engine';
import {
  TagStorageRepository,
  ProjectStorageRepository,
  ChatStorageRepository,
  MessageStorageRepository,
  ChatGroupStorageRepository,
  FileStorageRepository,
  NoteStorageRepository,
  LinkStorageRepository,
  BookmarkStorageRepository,
  ReferenceStorageRepository,
  CodeSnippetStorageRepository,
} from '@/repositories/storage/entity-repositories.storage';
import { generateEntityId } from '@/domain/value-objects/id';
import { createCurrentTimestamp } from '@/domain/value-objects/timestamp';
import { ValidationError, ConflictError } from '@/utils/errors';

describe('TagService & Deterministic Organization', () => {
  let storage: MemoryStorageEngine;
  let tagRepo: TagStorageRepository;
  let projectRepo: ProjectStorageRepository;
  let chatRepo: ChatStorageRepository;
  let messageRepo: MessageStorageRepository;
  let chatGroupRepo: ChatGroupStorageRepository;
  let fileRepo: FileStorageRepository;
  let noteRepo: NoteStorageRepository;
  let linkRepo: LinkStorageRepository;
  let bookmarkRepo: BookmarkStorageRepository;
  let referenceRepo: ReferenceStorageRepository;
  let snippetRepo: CodeSnippetStorageRepository;
  let tagService: TagService;
  let projectService: ProjectService;
  let chatService: ChatService;

  beforeEach(() => {
    storage = new MemoryStorageEngine();
    tagRepo = new TagStorageRepository(storage);
    projectRepo = new ProjectStorageRepository(storage);
    messageRepo = new MessageStorageRepository(storage);
    chatGroupRepo = new ChatGroupStorageRepository(storage);
    chatRepo = new ChatStorageRepository(storage);
    fileRepo = new FileStorageRepository(storage);
    noteRepo = new NoteStorageRepository(storage);
    linkRepo = new LinkStorageRepository(storage);
    bookmarkRepo = new BookmarkStorageRepository(storage);
    referenceRepo = new ReferenceStorageRepository(storage);
    snippetRepo = new CodeSnippetStorageRepository(storage);

    projectService = new ProjectService(projectRepo);
    chatService = new ChatService(chatRepo, messageRepo, chatGroupRepo);
    tagService = new TagService(
      tagRepo,
      projectRepo,
      chatRepo,
      fileRepo,
      noteRepo,
      linkRepo,
      bookmarkRepo,
      referenceRepo,
      snippetRepo,
    );
  });

  describe('Tag Name Normalization & Validation', () => {
    it('normalizes tag names with trimming, lowercase, and leading hash stripping', () => {
      expect(tagService.normalizeTagName(' Frontend ')).toBe('frontend');
      expect(tagService.normalizeTagName('#react-native')).toBe('react-native');
      expect(tagService.normalizeTagName('###UI_Design ')).toBe('ui_design');
      expect(tagService.normalizeTagName('BACKEND')).toBe('backend');
    });

    it('rejects empty or invalid tag names', async () => {
      const workspaceId = generateEntityId();
      await expect(tagService.createTag({ workspaceId, name: '   ' })).rejects.toThrow(
        ValidationError,
      );

      await expect(tagService.createTag({ workspaceId, name: '###' })).rejects.toThrow(
        ValidationError,
      );
    });
  });

  describe('Tag Creation & Uniqueness', () => {
    it('creates a canonical tag and prevents collision within the same workspace', async () => {
      const workspaceId = generateEntityId();

      const tag1 = await tagService.createTag({
        workspaceId,
        name: 'Frontend',
        color: 'blue',
        description: 'Client-side user interface',
      });

      expect(tag1.id).toBeDefined();
      expect(tag1.workspaceId).toBe(workspaceId);
      expect(tag1.name).toBe('Frontend');
      expect(tag1.normalizedName).toBe('frontend');
      expect(tag1.color).toBe('blue');

      // Attempting to create duplicate "frontend" or "#FRONTEND" in same workspace should throw ConflictError
      await expect(
        tagService.createTag({
          workspaceId,
          name: 'frontend',
        }),
      ).rejects.toThrow(ConflictError);

      await expect(
        tagService.createTag({
          workspaceId,
          name: '#FRONTEND ',
        }),
      ).rejects.toThrow(ConflictError);
    });

    it('maintains workspace isolation for tag names across different workspaces', async () => {
      const workspaceA = generateEntityId();
      const workspaceB = generateEntityId();

      const tagA = await tagService.createTag({
        workspaceId: workspaceA,
        name: 'infrastructure',
      });

      const tagB = await tagService.createTag({
        workspaceId: workspaceB,
        name: 'infrastructure',
      });

      expect(tagA.id).not.toBe(tagB.id);
      expect(tagA.workspaceId).toBe(workspaceA);
      expect(tagB.workspaceId).toBe(workspaceB);

      const listA = await tagService.listTags(workspaceA);
      const listB = await tagService.listTags(workspaceB);

      expect(listA.length).toBe(1);
      expect(listB.length).toBe(1);
      expect(listA[0]!.id).toBe(tagA.id);
      expect(listB[0]!.id).toBe(tagB.id);
    });
  });

  describe('Tag Update & Renaming Preservation', () => {
    it('renames a tag while preserving its entity ID and relationships', async () => {
      const workspaceId = generateEntityId();

      const tag = await tagService.createTag({
        workspaceId,
        name: 'front-end',
        color: 'blue',
      });

      const updated = await tagService.updateTag(tag.id, {
        name: 'frontend-core',
        color: 'cyan',
        description: 'Updated core front-end',
      });

      expect(updated.id).toBe(tag.id);
      expect(updated.name).toBe('frontend-core');
      expect(updated.normalizedName).toBe('frontend-core');
      expect(updated.color).toBe('cyan');
      expect(updated.description).toBe('Updated core front-end');
    });

    it('prevents renaming a tag to an existing normalized name in the workspace', async () => {
      const workspaceId = generateEntityId();

      await tagService.createTag({ workspaceId, name: 'alpha' });
      const tag2 = await tagService.createTag({ workspaceId, name: 'beta' });

      await expect(tagService.updateTag(tag2.id, { name: 'ALPHA' })).rejects.toThrow(ConflictError);
    });
  });

  describe('Tag Assignment to Projects and Chats', () => {
    it('assigns and removes tags from Projects with full persistence', async () => {
      const workspaceId = generateEntityId();

      const tag1 = await tagService.createTag({ workspaceId, name: 'cricket' });
      const tag2 = await tagService.createTag({ workspaceId, name: 'auction' });

      const project = await projectService.createProject({
        workspaceId,
        name: 'CricAuction',
        tags: [tag1.id],
      });

      expect(project.tags).toContain(tag1.id);

      // Add tag2
      const updated = await tagService.addTagToProject(project.id, tag2.id);
      expect(updated.tags).toEqual([tag1.id, tag2.id]);

      // Remove tag1
      const removed = await tagService.removeTagFromProject(project.id, tag1.id);
      expect(removed.tags).toEqual([tag2.id]);

      // Get assigned tags
      const assigned = await tagService.getProjectTags(project.id);
      expect(assigned.length).toBe(1);
      expect(assigned[0]!.name).toBe('auction');
    });

    it('assigns and removes tags from Chats with full persistence', async () => {
      const workspaceId = generateEntityId();

      const project = await projectService.createProject({
        workspaceId,
        name: 'Compiler Core',
      });

      const tag1 = await tagService.createTag({ workspaceId, name: 'parser' });
      const tag2 = await tagService.createTag({ workspaceId, name: 'ast' });

      const chat = await chatService.createChat({
        workspaceId,
        projectId: project.id,
        title: 'AST Generator',
        tags: [tag1.id],
      });

      expect(chat.tags).toContain(tag1.id);

      // Add tag2
      const updated = await tagService.addTagToChat(chat.id, tag2.id);
      expect(updated.tags).toEqual([tag1.id, tag2.id]);

      // Remove tag1
      const removed = await tagService.removeTagFromChat(chat.id, tag1.id);
      expect(removed.tags).toEqual([tag2.id]);

      // Get assigned tags
      const assigned = await tagService.getChatTags(chat.id);
      expect(assigned.length).toBe(1);
      expect(assigned[0]!.name).toBe('ast');
    });

    it('enforces workspace isolation on tag assignment', async () => {
      const workspaceA = generateEntityId();
      const workspaceB = generateEntityId();

      const projectA = await projectService.createProject({
        workspaceId: workspaceA,
        name: 'Project in Workspace A',
      });

      const tagB = await tagService.createTag({
        workspaceId: workspaceB,
        name: 'tag-in-workspace-b',
      });

      // Attempting to assign tag from Workspace B to Project in Workspace A should be rejected
      await expect(tagService.addTagToProject(projectA.id, tagB.id)).rejects.toThrow(
        ValidationError,
      );
    });
  });

  describe('Tag Deletion Safety Rules', () => {
    it('deleting a tag removes assignments from Projects and Chats without deleting the entities', async () => {
      const workspaceId = generateEntityId();

      const tagToDelete = await tagService.createTag({ workspaceId, name: 'deprecated-tag' });
      const tagToKeep = await tagService.createTag({ workspaceId, name: 'stable-tag' });

      const project = await projectService.createProject({
        workspaceId,
        name: 'Active Project',
        tags: [tagToDelete.id, tagToKeep.id],
      });

      const chat = await chatService.createChat({
        workspaceId,
        projectId: project.id,
        title: 'Active Conversation',
        tags: [tagToDelete.id, tagToKeep.id],
      });

      // Verify usage count before delete
      const countBefore = await tagService.getTagUsageCount(workspaceId, tagToDelete.id);
      expect(countBefore.totalCount).toBe(2);
      expect(countBefore.projectCount).toBe(1);
      expect(countBefore.chatCount).toBe(1);

      // Delete the tag
      const deleted = await tagService.deleteTag(tagToDelete.id);
      expect(deleted).toBe(true);

      // Verify tag record is gone
      const foundTag = await tagService.getTag(tagToDelete.id);
      expect(foundTag).toBeNull();

      // Verify Project is intact and tagToDelete was cleanly removed
      const freshProject = await projectService.getProject(project.id);
      expect(freshProject).not.toBeNull();
      expect(freshProject.tags).toEqual([tagToKeep.id]);

      // Verify Chat is intact and tagToDelete was cleanly removed
      const freshChat = await chatService.getChatOrThrow(chat.id);
      expect(freshChat).not.toBeNull();
      expect(freshChat.tags).toEqual([tagToKeep.id]);
    });

    it('deleting a tag cleans up assignments across all Phase 9 resource types (Files, Notes, Links, Bookmarks, References, Snippets)', async () => {
      const workspaceId = generateEntityId();
      const projectId = generateEntityId();
      const now = createCurrentTimestamp();

      const tagToDelete = await tagService.createTag({ workspaceId, name: 'temp-tag' });
      const tagToKeep = await tagService.createTag({ workspaceId, name: 'permanent-tag' });

      // Create a record in each of the 6 resource stores
      await fileRepo.save({
        id: generateEntityId(),
        workspaceId,
        projectId,
        name: 'File 1',
        originalFilename: 'file1.txt',
        mimeType: 'text/plain',
        sizeBytes: 10,
        pathOrReference: 'file_key_1',
        tags: [tagToDelete.id, tagToKeep.id],
        isArchived: false,
        createdAt: now,
        updatedAt: now,
      });

      await noteRepo.save({
        id: generateEntityId(),
        workspaceId,
        projectId,
        title: 'Note 1',
        content: 'Content 1',
        isPinned: false,
        isArchived: false,
        tags: [tagToDelete.id, tagToKeep.id],
        createdAt: now,
        updatedAt: now,
      });

      await linkRepo.save({
        id: generateEntityId(),
        workspaceId,
        projectId,
        url: 'https://example.com',
        title: 'Link 1',
        domain: 'example.com',
        tags: [tagToDelete.id, tagToKeep.id],
        createdAt: now,
        updatedAt: now,
      });

      await bookmarkRepo.save({
        id: generateEntityId(),
        workspaceId,
        projectId,
        title: 'Bookmark 1',
        targetEntityType: 'file',
        targetEntityId: generateEntityId(),
        order: 0,
        tags: [tagToDelete.id, tagToKeep.id],
        createdAt: now,
        updatedAt: now,
      });

      await referenceRepo.save({
        id: generateEntityId(),
        workspaceId,
        projectId,
        title: 'Reference 1',
        referenceKind: 'url',
        targetUri: 'https://spec.org',
        sourceEntityType: 'project',
        sourceEntityId: projectId,
        tags: [tagToDelete.id, tagToKeep.id],
        createdAt: now,
        updatedAt: now,
      });

      await snippetRepo.save({
        id: generateEntityId(),
        workspaceId,
        projectId,
        title: 'Snippet 1',
        language: 'typescript',
        code: 'const x = 1;',
        tags: [tagToDelete.id, tagToKeep.id],
        createdAt: now,
        updatedAt: now,
      });

      // Verify usage counts
      const counts = await tagService.getTagUsageCount(workspaceId, tagToDelete.id);
      expect(counts.fileCount).toBe(1);
      expect(counts.noteCount).toBe(1);
      expect(counts.linkCount).toBe(1);
      expect(counts.bookmarkCount).toBe(1);
      expect(counts.referenceCount).toBe(1);
      expect(counts.codeSnippetCount).toBe(1);
      expect(counts.totalCount).toBe(6);

      // Delete the tag
      await tagService.deleteTag(tagToDelete.id);

      // Verify each resource still has tagToKeep but not tagToDelete
      const [file] = await fileRepo.findByWorkspaceId(workspaceId);
      expect(file?.tags).toEqual([tagToKeep.id]);

      const [note] = await noteRepo.findByWorkspaceId(workspaceId);
      expect(note?.tags).toEqual([tagToKeep.id]);

      const [link] = await linkRepo.findByWorkspaceId(workspaceId);
      expect(link?.tags).toEqual([tagToKeep.id]);

      const [bookmark] = await bookmarkRepo.findByWorkspaceId(workspaceId);
      expect(bookmark?.tags).toEqual([tagToKeep.id]);

      const [reference] = await referenceRepo.findByWorkspaceId(workspaceId);
      expect(reference?.tags).toEqual([tagToKeep.id]);

      const [snippet] = await snippetRepo.findByWorkspaceId(workspaceId);
      expect(snippet?.tags).toEqual([tagToKeep.id]);
    });
  });

  describe('Deterministic Multi-Filter Semantics', () => {
    it('combines status, pinned, and tag filters with strict AND semantics for Projects', async () => {
      const workspaceId = generateEntityId();

      const tagWeb = await tagService.createTag({ workspaceId, name: 'web' });
      const tagMobile = await tagService.createTag({ workspaceId, name: 'mobile' });

      const p1 = await projectService.createProject({
        workspaceId,
        name: 'Web Frontend',
        tags: [tagWeb.id],
      });
      await projectService.setPinned(p1.id, true);

      const p2 = await projectService.createProject({
        workspaceId,
        name: 'Mobile App',
        tags: [tagMobile.id],
      });
      await projectService.setPinned(p2.id, true);

      const p3 = await projectService.createProject({
        workspaceId,
        name: 'Web Backend',
        tags: [tagWeb.id],
      });
      // p3 is active but not pinned

      // 1. Filter: Status Active + Tag Web -> p1 and p3
      const activeWeb = await projectService.listProjects(workspaceId, {
        filter: 'active',
        tagId: tagWeb.id,
      });
      const activeWebIds = activeWeb.map((p) => p.id);
      expect(activeWebIds).toContain(p1.id);
      expect(activeWebIds).toContain(p3.id);
      expect(activeWebIds.length).toBe(2);

      // 2. Filter: Status Pinned + Tag Web -> only p1
      const pinnedWeb = await projectService.listProjects(workspaceId, {
        filter: 'pinned',
        tagId: tagWeb.id,
      });
      expect(pinnedWeb.map((p) => p.id)).toEqual([p1.id]);

      // 3. Filter: Status Pinned + Tag Mobile -> only p2
      const pinnedMobile = await projectService.listProjects(workspaceId, {
        filter: 'pinned',
        tagId: tagMobile.id,
      });
      expect(pinnedMobile.map((p) => p.id)).toEqual([p2.id]);
    });

    it('combines status, favorites, and tag filters with strict AND semantics for Chats', async () => {
      const workspaceId = generateEntityId();
      const project = await projectService.createProject({ workspaceId, name: 'CricAuction' });

      const tagFrontend = await tagService.createTag({ workspaceId, name: 'frontend' });
      const tagBackend = await tagService.createTag({ workspaceId, name: 'backend' });

      const c1 = await chatService.createChat({
        workspaceId,
        projectId: project.id,
        title: 'UI Design System',
        tags: [tagFrontend.id],
        isFavorite: true,
      });

      const c2 = await chatService.createChat({
        workspaceId,
        projectId: project.id,
        title: 'GraphQL API',
        tags: [tagBackend.id],
        isFavorite: true,
      });

      const c3 = await chatService.createChat({
        workspaceId,
        projectId: project.id,
        title: 'Component Library',
        tags: [tagFrontend.id],
        isFavorite: false,
      });

      // Filter: favorites + tagFrontend -> only c1
      const favoriteFrontend = await chatService.listChats(project.id, {
        status: 'favorites',
        tagId: tagFrontend.id,
      });
      expect(favoriteFrontend.map((c) => c.id)).toEqual([c1.id]);

      // Filter: favorites + tagBackend -> only c2
      const favoriteBackend = await chatService.listChats(project.id, {
        status: 'favorites',
        tagId: tagBackend.id,
      });
      expect(favoriteBackend.map((c) => c.id)).toEqual([c2.id]);

      // Filter: active + tagFrontend -> c1 and c3
      const activeFrontend = await chatService.listChats(project.id, {
        status: 'active',
        tagId: tagFrontend.id,
      });
      const activeFrontendIds = activeFrontend.map((c) => c.id);
      expect(activeFrontendIds).toContain(c1.id);
      expect(activeFrontendIds).toContain(c3.id);
      expect(activeFrontendIds.length).toBe(2);
    });
  });
});
