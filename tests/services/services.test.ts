import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryStorageEngine } from '@/persistence/memory/memory.storage-engine';
import { StorageService } from '@/services/storage.service';
import { WorkspaceService } from '@/services/workspace.service';
import { ProjectService } from '@/services/project.service';
import { ChatService } from '@/services/chat.service';
import { TaskService } from '@/services/task.service';
import { DecisionService } from '@/services/decision.service';
import { RelationshipService } from '@/services/relationship.service';
import { InboxService } from '@/services/inbox.service';

describe('Domain Services Layer', () => {
  let storageEngine: MemoryStorageEngine;
  let storageService: StorageService;
  let workspaceService: WorkspaceService;
  let projectService: ProjectService;
  let chatService: ChatService;
  let taskService: TaskService;
  let decisionService: DecisionService;
  let relationshipService: RelationshipService;
  let inboxService: InboxService;

  beforeEach(async () => {
    storageEngine = new MemoryStorageEngine();
    storageService = new StorageService(storageEngine);
    await storageService.initialize();

    workspaceService = new WorkspaceService(storageService.workspaces, storageService.users);
    projectService = new ProjectService(storageService.projects);
    chatService = new ChatService(storageService.chats, storageService.messages);
    taskService = new TaskService(storageService.tasks);
    decisionService = new DecisionService(storageService.decisions);
    relationshipService = new RelationshipService(storageService.relationships);
    inboxService = new InboxService(storageService.inboxItems);
  });

  it('creates and retrieves default workspace and user', async () => {
    const { workspace, user } = await workspaceService.getOrCreateDefaultWorkspace();

    expect(workspace).toBeDefined();
    expect(workspace.name).toBe('My WorkBench');
    expect(user).toBeDefined();
    expect(user.displayName).toBe('Local User');
    expect(user.isLocal).toBe(true);

    // Second call should return existing records
    const second = await workspaceService.getOrCreateDefaultWorkspace();
    expect(second.workspace.id).toBe(workspace.id);
    expect(second.user.id).toBe(user.id);
  });

  it('creates project with sanitized slug and tags', async () => {
    const { workspace } = await workspaceService.getOrCreateDefaultWorkspace();

    const project = await projectService.createProject({
      workspaceId: workspace.id,
      name: 'Signature Studio',
      description: 'Design workspace',
      color: '#3b82f6',
      tags: ['design', 'css'],
    });

    expect(project.id).toBeDefined();
    expect(project.name).toBe('Signature Studio');
    expect(project.slug).toBe('signature-studio');
    expect(project.tags).toEqual(['design', 'css']);

    const retrieved = await projectService.getProject(project.id);
    expect(retrieved.id).toBe(project.id);
  });

  it('creates chat and sequences messages correctly', async () => {
    const { workspace } = await workspaceService.getOrCreateDefaultWorkspace();
    const project = await projectService.createProject({
      workspaceId: workspace.id,
      name: 'CricAuction',
    });

    const chat = await chatService.createChat({
      workspaceId: workspace.id,
      projectId: project.id,
      title: 'Auction Engine Architecture',
    });

    const m1 = await chatService.addMessage({
      chatId: chat.id,
      role: 'user',
      content: 'How should we handle websocket auctions?',
    });

    const m2 = await chatService.addMessage({
      chatId: chat.id,
      role: 'assistant',
      content: 'We can use an in-memory lock with Redis or local event bus.',
    });

    expect(m1.sequenceNumber).toBe(1);
    expect(m2.sequenceNumber).toBe(2);

    const { chat: reloadedChat, messages } = await chatService.getChatWithMessages(chat.id);
    expect(reloadedChat.messageCount).toBe(2);
    expect(messages.length).toBe(2);
  });

  it('creates tasks and transitions status', async () => {
    const { workspace } = await workspaceService.getOrCreateDefaultWorkspace();
    const project = await projectService.createProject({
      workspaceId: workspace.id,
      name: 'Task Test',
    });

    const task = await taskService.createTask({
      workspaceId: workspace.id,
      projectId: project.id,
      title: 'Implement Auth',
      priority: 'high',
    });

    expect(task.status).toBe('todo');
    expect(task.completedAt).toBeUndefined();

    const completed = await taskService.updateTaskStatus(task.id, 'done');
    expect(completed.status).toBe('done');
    expect(completed.completedAt).toBeDefined();
  });

  it('creates decisions with rationale and conclusions', async () => {
    const { workspace } = await workspaceService.getOrCreateDefaultWorkspace();
    const project = await projectService.createProject({
      workspaceId: workspace.id,
      name: 'Decision Test',
    });

    const decision = await decisionService.createDecision({
      workspaceId: workspace.id,
      projectId: project.id,
      title: 'Choose IndexedDB over localStorage',
      decision: 'Adopt IndexedDB with typed repository abstraction',
      rationale: 'Supports structured queries, async transactions, and future SQLite migration',
    });

    expect(decision.id).toBeDefined();
    expect(decision.status).toBe('accepted');
    expect(decision.title).toBe('Choose IndexedDB over localStorage');
  });

  it('links and unlinks entities in WorkBench Brain relationship graph', async () => {
    const { workspace } = await workspaceService.getOrCreateDefaultWorkspace();
    const project = await projectService.createProject({ workspaceId: workspace.id, name: 'P' });
    const chat = await chatService.createChat({
      workspaceId: workspace.id,
      projectId: project.id,
      title: 'C',
    });
    const task = await taskService.createTask({
      workspaceId: workspace.id,
      projectId: project.id,
      title: 'T',
    });

    // Link Task -> Chat (derived_from)
    const rel1 = await relationshipService.linkEntities({
      workspaceId: workspace.id,
      sourceEntityType: 'task',
      sourceEntityId: task.id,
      relationshipType: 'derived_from',
      targetEntityType: 'chat',
      targetEntityId: chat.id,
    });

    expect(rel1).toBeDefined();

    // Re-linking identical relationship should be idempotent
    const rel2 = await relationshipService.linkEntities({
      workspaceId: workspace.id,
      sourceEntityType: 'task',
      sourceEntityId: task.id,
      relationshipType: 'derived_from',
      targetEntityType: 'chat',
      targetEntityId: chat.id,
    });
    expect(rel2.id).toBe(rel1.id);

    // Query relationships
    const { outgoing, incoming } = await relationshipService.getEntityRelationships(
      'task',
      task.id,
    );
    expect(outgoing.length).toBe(1);
    expect(incoming.length).toBe(0);

    const chatRels = await relationshipService.getEntityRelationships('chat', chat.id);
    expect(chatRels.incoming.length).toBe(1);

    // Unlink
    const unlinkedCount = await relationshipService.unlinkEntities(
      task.id,
      'derived_from',
      chat.id,
    );
    expect(unlinkedCount).toBe(1);

    const afterUnlink = await relationshipService.getEntityRelationships('task', task.id);
    expect(afterUnlink.outgoing.length).toBe(0);
  });

  it('captures and triages inbox items', async () => {
    const { workspace } = await workspaceService.getOrCreateDefaultWorkspace();

    const item = await inboxService.captureItem({
      workspaceId: workspace.id,
      title: 'Quick Note from Meeting',
      captureType: 'raw_text',
      rawContent: 'Check out the new design system specs.',
    });

    expect(item.status).toBe('unprocessed');

    const unprocessed = await inboxService.getUnprocessedItems();
    expect(unprocessed.length).toBe(1);

    const triaged = await inboxService.markTriaged(item.id);
    expect(triaged.status).toBe('triaged');
    expect(triaged.triagedAt).toBeDefined();

    const unprocessedAfter = await inboxService.getUnprocessedItems();
    expect(unprocessedAfter.length).toBe(0);
  });
});
