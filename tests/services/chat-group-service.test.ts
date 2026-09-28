import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryStorageEngine } from '@/persistence/memory/memory.storage-engine';
import { StorageService } from '@/services/storage.service';
import { WorkspaceService } from '@/services/workspace.service';
import { ProjectService } from '@/services/project.service';
import { ChatService } from '@/services/chat.service';
import { ChatGroupService } from '@/services/chat-group.service';
import { ConflictError } from '@/utils/errors';
import { Workspace, Project } from '@/domain/entities';

describe('ChatGroupService', () => {
  let storageEngine: MemoryStorageEngine;
  let storageService: StorageService;
  let workspaceService: WorkspaceService;
  let projectService: ProjectService;
  let chatService: ChatService;
  let chatGroupService: ChatGroupService;

  let workspace: Workspace;
  let project: Project;

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

    project = await projectService.createProject({
      workspaceId: workspace.id,
      name: 'Test Project',
    });
  });

  it('creates chat group with default flags and metadata', async () => {
    const group = await chatGroupService.createGroup({
      workspaceId: workspace.id,
      projectId: project.id,
      name: 'Sprint Planning',
      description: 'Discussions related to current sprint',
      color: 'violet',
      icon: 'kanban',
    });

    expect(group.id).toBeDefined();
    expect(group.name).toBe('Sprint Planning');
    expect(group.description).toBe('Discussions related to current sprint');
    expect(group.color).toBe('violet');
    expect(group.icon).toBe('kanban');
    expect(group.isPinned).toBe(false);
    expect(group.isCollapsed).toBe(false);
    expect(group.createdAt).toBeDefined();
    expect(group.updatedAt).toBeDefined();
  });

  it('prevents duplicate group names within the same project', async () => {
    await chatGroupService.createGroup({
      workspaceId: workspace.id,
      projectId: project.id,
      name: 'Architecture',
    });

    await expect(
      chatGroupService.createGroup({
        workspaceId: workspace.id,
        projectId: project.id,
        name: 'architecture',
      }),
    ).rejects.toThrow(ConflictError);
  });

  it('updates group name, description, color, and icon', async () => {
    const group = await chatGroupService.createGroup({
      workspaceId: workspace.id,
      projectId: project.id,
      name: 'Initial Name',
    });

    const updated = await chatGroupService.updateGroup(group.id, {
      name: 'Renamed Name',
      description: 'New Description',
      color: 'green',
      icon: 'sparkles',
    });

    expect(updated.name).toBe('Renamed Name');
    expect(updated.description).toBe('New Description');
    expect(updated.color).toBe('green');
    expect(updated.icon).toBe('sparkles');
  });

  it('pins, unpins, and toggles collapse on groups', async () => {
    const group = await chatGroupService.createGroup({
      workspaceId: workspace.id,
      projectId: project.id,
      name: 'Important Group',
    });

    const pinned = await chatGroupService.pinGroup(group.id);
    expect(pinned.isPinned).toBe(true);

    const unpinned = await chatGroupService.unpinGroup(group.id);
    expect(unpinned.isPinned).toBe(false);

    const collapsed = await chatGroupService.toggleGroupCollapse(group.id);
    expect(collapsed.isCollapsed).toBe(true);

    const expanded = await chatGroupService.toggleGroupCollapse(group.id);
    expect(expanded.isCollapsed).toBe(false);
  });

  it('CRITICAL SAFETY RULE: deleting a group ungroups child chats instead of deleting them', async () => {
    const group = await chatGroupService.createGroup({
      workspaceId: workspace.id,
      projectId: project.id,
      name: 'Category To Delete',
    });

    const chat1 = await chatService.createChat({
      workspaceId: workspace.id,
      projectId: project.id,
      chatGroupId: group.id,
      title: 'Chat 1 in Group',
    });

    const chat2 = await chatService.createChat({
      workspaceId: workspace.id,
      projectId: project.id,
      chatGroupId: group.id,
      title: 'Chat 2 in Group',
    });

    expect(chat1.chatGroupId).toBe(group.id);
    expect(chat2.chatGroupId).toBe(group.id);

    // Delete the group
    await chatGroupService.deleteGroup(group.id);

    // Verify group is removed
    const deletedGroup = await chatGroupService.getGroup(group.id);
    expect(deletedGroup).toBeNull();

    // Verify both chats STILL EXIST in the project, but have chatGroupId = undefined
    const reloadedChat1 = await chatService.getChatOrThrow(chat1.id);
    const reloadedChat2 = await chatService.getChatOrThrow(chat2.id);

    expect(reloadedChat1).toBeDefined();
    expect(reloadedChat1.chatGroupId).toBeUndefined();
    expect(reloadedChat1.projectId).toBe(project.id);

    expect(reloadedChat2).toBeDefined();
    expect(reloadedChat2.chatGroupId).toBeUndefined();
    expect(reloadedChat2.projectId).toBe(project.id);
  });
});
