import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryStorageEngine } from '@/persistence/memory/memory.storage-engine';
import { StorageService } from '@/services/storage.service';
import { BookmarkService } from '@/services/bookmark.service';
import { WorkspaceService } from '@/services/workspace.service';
import { ProjectService } from '@/services/project.service';
import { EntityId } from '@/types';

describe('BookmarkService', () => {
  let storageEngine: MemoryStorageEngine;
  let storageService: StorageService;
  let bookmarkService: BookmarkService;
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
    bookmarkService = new BookmarkService(storageService.bookmarks);

    const { workspace } = await workspaceService.getOrCreateDefaultWorkspace();
    workspaceId = workspace.id;

    const project = await projectService.createProject({
      workspaceId,
      name: 'Bookmark Test',
    });
    projectId = project.id;
  });

  it('creates, retrieves, updates, and deletes bookmarks', async () => {
    const bookmark = await bookmarkService.createBookmark({
      workspaceId,
      projectId,
      title: 'Active Architecture Chat',
      targetEntityType: 'chat',
      targetEntityId: 'chat_123',
      targetUrl: '/projects/p1/chats/chat_123',
      note: 'Key discussion on schema',
      order: 1,
    });

    expect(bookmark.id).toBeDefined();
    expect(bookmark.title).toBe('Active Architecture Chat');
    expect(bookmark.targetEntityType).toBe('chat');

    const retrieved = await bookmarkService.getBookmarkOrThrow(bookmark.id, projectId);
    expect(retrieved.id).toBe(bookmark.id);

    const updated = await bookmarkService.updateBookmark(
      bookmark.id,
      {
        title: 'Updated Bookmark',
        note: 'Updated Note',
      },
      projectId,
    );
    expect(updated.title).toBe('Updated Bookmark');

    const deleted = await bookmarkService.deleteBookmark(bookmark.id, projectId);
    expect(deleted).toBe(true);
    expect(await bookmarkService.getBookmark(bookmark.id)).toBeNull();
  });
});
