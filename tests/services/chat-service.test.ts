import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryStorageEngine } from '@/persistence/memory/memory.storage-engine';
import { StorageService } from '@/services/storage.service';
import { WorkspaceService } from '@/services/workspace.service';
import { ProjectService } from '@/services/project.service';
import { ChatService } from '@/services/chat.service';
import { ChatGroupService } from '@/services/chat-group.service';
import { NotFoundError, ValidationError } from '@/utils/errors';
import { Workspace, Project, ChatGroup } from '@/domain/entities';

describe('ChatService', () => {
  let storageEngine: MemoryStorageEngine;
  let storageService: StorageService;
  let workspaceService: WorkspaceService;
  let projectService: ProjectService;
  let chatService: ChatService;
  let chatGroupService: ChatGroupService;

  let workspace: Workspace;
  let projectA: Project;
  let projectB: Project;
  let groupA: ChatGroup;

  beforeEach(async () => {
    storageEngine = new MemoryStorageEngine();
    storageService = new StorageService(storageEngine);
    await storageService.initialize();

    workspaceService = new WorkspaceService(storageService.workspaces, storageService.users);
    projectService = new ProjectService(storageService.projects);
    chatService = new ChatService(
      storageService.chats,
      storageService.messages,
      storageService.chatGroups,
    );
    chatGroupService = new ChatGroupService(
      storageService.chatGroups,
      storageService.chats,
      storageService.projects,
    );

    const init = await workspaceService.getOrCreateDefaultWorkspace();
    workspace = init.workspace;

    projectA = await projectService.createProject({
      workspaceId: workspace.id,
      name: 'Project Alpha',
    });

    projectB = await projectService.createProject({
      workspaceId: workspace.id,
      name: 'Project Beta',
    });

    groupA = await chatGroupService.createGroup({
      workspaceId: workspace.id,
      projectId: projectA.id,
      name: 'Architecture Planning',
    });
  });

  it('creates chat with default flags, timestamps, and metadata', async () => {
    const chat = await chatService.createChat({
      workspaceId: workspace.id,
      projectId: projectA.id,
      title: 'Auth Handshake Spec',
      description: 'HMAC SHA-256 webhook spec',
      tags: ['auth', 'security'],
      source: 'manual',
    });

    expect(chat.id).toBeDefined();
    expect(chat.title).toBe('Auth Handshake Spec');
    expect(chat.description).toBe('HMAC SHA-256 webhook spec');
    expect(chat.workspaceId).toBe(workspace.id);
    expect(chat.projectId).toBe(projectA.id);
    expect(chat.chatGroupId).toBeUndefined();
    expect(chat.isPinned).toBe(false);
    expect(chat.isFavorite).toBe(false);
    expect(chat.isArchived).toBe(false);
    expect(chat.messageCount).toBe(0);
    expect(chat.tags).toEqual(['auth', 'security']);
    expect(chat.createdAt).toBeDefined();
    expect(chat.updatedAt).toBeDefined();
    expect(chat.lastActivityAt).toBeDefined();
  });

  it('validates non-empty title on creation', async () => {
    await expect(
      chatService.createChat({
        workspaceId: workspace.id,
        projectId: projectA.id,
        title: '   ',
      }),
    ).rejects.toThrow(ValidationError);
  });

  it('retrieves chat and handles NotFoundError', async () => {
    const chat = await chatService.createChat({
      workspaceId: workspace.id,
      projectId: projectA.id,
      title: 'Sample Chat',
    });

    const found = await chatService.getChat(chat.id);
    expect(found?.id).toBe(chat.id);

    const foundOrThrow = await chatService.getChatOrThrow(chat.id);
    expect(foundOrThrow.id).toBe(chat.id);

    const missing = await chatService.getChat('00000000-0000-0000-0000-000000000000');
    expect(missing).toBeNull();

    await expect(
      chatService.getChatOrThrow('00000000-0000-0000-0000-000000000000'),
    ).rejects.toThrow(NotFoundError);
  });

  it('filters and sorts chats deterministically', async () => {
    const c1 = await chatService.createChat({
      workspaceId: workspace.id,
      projectId: projectA.id,
      title: 'Beta Chat',
      isPinned: true,
    });

    const c2 = await chatService.createChat({
      workspaceId: workspace.id,
      projectId: projectA.id,
      title: 'Alpha Chat',
      isFavorite: true,
    });

    const c3 = await chatService.createChat({
      workspaceId: workspace.id,
      projectId: projectA.id,
      title: 'Gamma Chat',
    });
    await chatService.archiveChat(c3.id);

    // Filter Active
    const active = await chatService.listChats(projectA.id, { status: 'active' });
    expect(active.length).toBe(2);
    expect(active.some((c) => c.id === c3.id)).toBe(false);

    // Filter Pinned
    const pinned = await chatService.listChats(projectA.id, { status: 'pinned' });
    expect(pinned.length).toBe(1);
    expect(pinned[0]?.id).toBe(c1.id);

    // Filter Favorites
    const favorites = await chatService.listChats(projectA.id, { status: 'favorites' });
    expect(favorites.length).toBe(1);
    expect(favorites[0]?.id).toBe(c2.id);

    // Filter Archived
    const archived = await chatService.listChats(projectA.id, { status: 'archived' });
    expect(archived.length).toBe(1);
    expect(archived[0]?.id).toBe(c3.id);

    // Sort Title A-Z
    const sortedTitle = await chatService.listChats(projectA.id, {
      status: 'active',
      sortBy: 'title',
      sortDirection: 'asc',
    });
    expect(sortedTitle[0]?.title).toBe('Alpha Chat');
    expect(sortedTitle[1]?.title).toBe('Beta Chat');
  });

  it('updates chat details', async () => {
    const chat = await chatService.createChat({
      workspaceId: workspace.id,
      projectId: projectA.id,
      title: 'Original Title',
    });

    const updated = await chatService.updateChat(chat.id, {
      title: 'Updated Title',
      description: 'New Description',
      chatGroupId: groupA.id,
      tags: ['updated'],
    });

    expect(updated.title).toBe('Updated Title');
    expect(updated.description).toBe('New Description');
    expect(updated.chatGroupId).toBe(groupA.id);
    expect(updated.tags).toEqual(['updated']);
  });

  it('pins, favorites, archives, and restores chats', async () => {
    const chat = await chatService.createChat({
      workspaceId: workspace.id,
      projectId: projectA.id,
      title: 'Lifecycle Chat',
    });

    const pinned = await chatService.pinChat(chat.id);
    expect(pinned.isPinned).toBe(true);

    const unpinned = await chatService.unpinChat(chat.id);
    expect(unpinned.isPinned).toBe(false);

    const favorited = await chatService.favoriteChat(chat.id);
    expect(favorited.isFavorite).toBe(true);

    const unfavorited = await chatService.unfavoriteChat(chat.id);
    expect(unfavorited.isFavorite).toBe(false);

    const archived = await chatService.archiveChat(chat.id);
    expect(archived.isArchived).toBe(true);
    expect(archived.archivedAt).toBeDefined();

    const restored = await chatService.restoreChat(chat.id);
    expect(restored.isArchived).toBe(false);
    expect(restored.archivedAt).toBeUndefined();
  });

  it('moves chat to group and removes chat from group', async () => {
    const chat = await chatService.createChat({
      workspaceId: workspace.id,
      projectId: projectA.id,
      title: 'Ungrouped Chat',
    });
    expect(chat.chatGroupId).toBeUndefined();

    const moved = await chatService.moveChatToGroup(chat.id, groupA.id);
    expect(moved.chatGroupId).toBe(groupA.id);

    const removed = await chatService.removeChatFromGroup(chat.id);
    expect(removed.chatGroupId).toBeUndefined();
  });

  it('duplicates a chat with clean copy policy and no messages', async () => {
    const original = await chatService.createChat({
      workspaceId: workspace.id,
      projectId: projectA.id,
      chatGroupId: groupA.id,
      title: 'Original Architecture Discussion',
      description: 'Original description',
      tags: ['design', 'adr'],
      isPinned: true,
      isFavorite: true,
    });

    const duplicate = await chatService.duplicateChat(original.id);

    expect(duplicate.id).not.toBe(original.id);
    expect(duplicate.title).toBe('Original Architecture Discussion (Copy)');
    expect(duplicate.description).toBe('Original description');
    expect(duplicate.workspaceId).toBe(original.workspaceId);
    expect(duplicate.projectId).toBe(original.projectId);
    expect(duplicate.chatGroupId).toBe(original.chatGroupId);
    expect(duplicate.tags).toEqual(['design', 'adr']);
    expect(duplicate.isPinned).toBe(false);
    expect(duplicate.isFavorite).toBe(false);
    expect(duplicate.isArchived).toBe(false);
    expect(duplicate.messageCount).toBe(0);
  });

  it('deletes chat permanently', async () => {
    const chat = await chatService.createChat({
      workspaceId: workspace.id,
      projectId: projectA.id,
      title: 'To Be Deleted',
    });

    await chatService.deleteChat(chat.id);
    const found = await chatService.getChat(chat.id);
    expect(found).toBeNull();
  });

  it('enforces project isolation when assigning chat to a group', async () => {
    const groupB = await chatGroupService.createGroup({
      workspaceId: workspace.id,
      projectId: projectB.id,
      name: 'Group in Project B',
    });

    const chatA = await chatService.createChat({
      workspaceId: workspace.id,
      projectId: projectA.id,
      title: 'Chat in Project A',
    });

    // Attempting to move Chat in Project A to Group in Project B must throw ValidationError
    await expect(chatService.moveChatToGroup(chatA.id, groupB.id)).rejects.toThrow(ValidationError);
  });
});
