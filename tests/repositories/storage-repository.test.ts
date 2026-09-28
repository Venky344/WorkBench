import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryStorageEngine } from '@/persistence/memory/memory.storage-engine';
import {
  ProjectStorageRepository,
  ChatStorageRepository,
  MessageStorageRepository,
  TaskStorageRepository,
  DecisionStorageRepository,
  TagStorageRepository,
  RelationshipStorageRepository,
  SourceStorageRepository,
  InboxItemStorageRepository,
} from '@/repositories/storage/entity-repositories.storage';
import { generateEntityId } from '@/domain/value-objects/id';
import { createCurrentTimestamp } from '@/domain/value-objects/timestamp';
import { NotFoundError } from '@/utils/errors';

describe('Specialized Storage Repositories', () => {
  let memoryEngine: MemoryStorageEngine;
  let projectRepo: ProjectStorageRepository;
  let chatRepo: ChatStorageRepository;
  let messageRepo: MessageStorageRepository;
  let taskRepo: TaskStorageRepository;
  let decisionRepo: DecisionStorageRepository;
  let tagRepo: TagStorageRepository;
  let relationshipRepo: RelationshipStorageRepository;
  let sourceRepo: SourceStorageRepository;
  let inboxRepo: InboxItemStorageRepository;

  beforeEach(async () => {
    memoryEngine = new MemoryStorageEngine();
    await memoryEngine.open();

    projectRepo = new ProjectStorageRepository(memoryEngine);
    chatRepo = new ChatStorageRepository(memoryEngine);
    messageRepo = new MessageStorageRepository(memoryEngine);
    taskRepo = new TaskStorageRepository(memoryEngine);
    decisionRepo = new DecisionStorageRepository(memoryEngine);
    tagRepo = new TagStorageRepository(memoryEngine);
    relationshipRepo = new RelationshipStorageRepository(memoryEngine);
    sourceRepo = new SourceStorageRepository(memoryEngine);
    inboxRepo = new InboxItemStorageRepository(memoryEngine);
  });

  it('handles Project repository queries by slug and workspace', async () => {
    const workspaceId = generateEntityId();
    const now = createCurrentTimestamp();

    const p1 = await projectRepo.save({
      id: generateEntityId(),
      workspaceId,
      name: 'Project Alpha',
      slug: 'project-alpha',
      isArchived: false,
      isPinned: false,
      order: 0,
      tags: [],
      createdAt: now,
      updatedAt: now,
    });

    const p2 = await projectRepo.save({
      id: generateEntityId(),
      workspaceId,
      name: 'Archived Project',
      slug: 'archived-project',
      isArchived: true,
      archivedAt: now,
      isPinned: false,
      order: 1,
      tags: [],
      createdAt: now,
      updatedAt: now,
    });

    expect(await projectRepo.findBySlug('project-alpha')).toEqual(p1);
    expect(await projectRepo.findBySlug('non-existent')).toBeNull();

    const active = await projectRepo.findActive(workspaceId);
    expect(active.length).toBe(1);
    expect(active[0]?.id).toBe(p1.id);

    const archived = await projectRepo.findArchived(workspaceId);
    expect(archived.length).toBe(1);
    expect(archived[0]?.id).toBe(p2.id);
  });

  it('handles Chat and Message ordering and deletion cascades', async () => {
    const workspaceId = generateEntityId();
    const projectId = generateEntityId();
    const now = createCurrentTimestamp();

    const chat = await chatRepo.save({
      id: generateEntityId(),
      workspaceId,
      projectId,
      title: 'Architecture Discussion',
      isPinned: true,
      isArchived: false,
      messageCount: 2,
      order: 0,
      tags: ['arch'],
      createdAt: now,
      updatedAt: now,
    });

    expect(await chatRepo.findById(chat.id)).not.toBeNull();
    expect((await chatRepo.findPinned(projectId)).length).toBe(1);

    await messageRepo.save({
      id: generateEntityId(),
      chatId: chat.id,
      role: 'user',
      content: 'Hello WorkBench',
      sequenceNumber: 1,
      createdAt: now,
      updatedAt: now,
    });

    await messageRepo.save({
      id: generateEntityId(),
      chatId: chat.id,
      role: 'assistant',
      content: 'Hello! How can I help organize your projects?',
      sequenceNumber: 2,
      createdAt: now,
      updatedAt: now,
    });

    const messages = await messageRepo.findByChatId(chat.id);
    expect(messages.length).toBe(2);
    expect(messages[0]?.sequenceNumber).toBe(1);
    expect(messages[1]?.sequenceNumber).toBe(2);

    const userMessages = await messageRepo.findByRole(chat.id, 'user');
    expect(userMessages.length).toBe(1);
    expect(userMessages[0]?.content).toBe('Hello WorkBench');

    const deletedCount = await messageRepo.deleteByChatId(chat.id);
    expect(deletedCount).toBe(2);
    expect((await messageRepo.findByChatId(chat.id)).length).toBe(0);
  });

  it('handles Source and InboxItem repositories', async () => {
    const workspaceId = generateEntityId();
    const now = createCurrentTimestamp();

    const source = await sourceRepo.save({
      id: generateEntityId(),
      workspaceId,
      provider: 'chatgpt',
      displayName: 'ChatGPT Shared Chat',
      sourceUrl: 'https://chatgpt.com/share/123',
      importedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    const foundSources = await sourceRepo.findByProvider('chatgpt');
    expect(foundSources.length).toBe(1);
    expect(foundSources[0]?.id).toBe(source.id);

    const inboxItem = await inboxRepo.save({
      id: generateEntityId(),
      workspaceId,
      title: 'Captured note',
      captureType: 'raw_text',
      rawContent: 'Sample note content',
      suggestedTags: ['quick'],
      status: 'unprocessed',
      createdAt: now,
      updatedAt: now,
    });

    const unprocessed = await inboxRepo.findUnprocessed();
    expect(unprocessed.length).toBe(1);
    expect(unprocessed[0]?.id).toBe(inboxItem.id);
  });

  it('handles Task and Decision status queries', async () => {
    const workspaceId = generateEntityId();
    const projectId = generateEntityId();
    const now = createCurrentTimestamp();

    await taskRepo.save({
      id: generateEntityId(),
      workspaceId,
      projectId,
      title: 'Setup Database',
      status: 'todo',
      priority: 'high',
      order: 0,
      tags: [],
      createdAt: now,
      updatedAt: now,
    });

    const todoTasks = await taskRepo.findByStatus(projectId, 'todo');
    expect(todoTasks.length).toBe(1);
    expect(todoTasks[0]?.title).toBe('Setup Database');

    await decisionRepo.save({
      id: generateEntityId(),
      workspaceId,
      projectId,
      title: 'Use IndexedDB',
      decision: 'Use IndexedDB for browser storage',
      rationale: 'Local-first, structured, asynchronous storage',
      status: 'accepted',
      tags: ['storage'],
      createdAt: now,
      updatedAt: now,
    });

    const decisions = await decisionRepo.findByStatus(projectId, 'accepted');
    expect(decisions.length).toBe(1);
    expect(decisions[0]?.title).toBe('Use IndexedDB');
  });

  it('handles Tag normalized searches', async () => {
    const workspaceId = generateEntityId();
    const now = createCurrentTimestamp();

    await tagRepo.save({
      id: generateEntityId(),
      workspaceId,
      name: 'Architecture',
      normalizedName: 'architecture',
      createdAt: now,
      updatedAt: now,
    });

    const found = await tagRepo.findByNormalizedName('architecture');
    expect(found).not.toBeNull();
    expect(found?.name).toBe('Architecture');

    const searchResults = await tagRepo.searchByName('arch');
    expect(searchResults.length).toBe(1);
  });

  it('handles Relationships linking entities in the WorkBench Brain', async () => {
    const workspaceId = generateEntityId();
    const projectId = generateEntityId();
    const chatId = generateEntityId();
    const taskId = generateEntityId();
    const now = createCurrentTimestamp();

    // Project -> Chat (contains)
    await relationshipRepo.save({
      id: generateEntityId(),
      workspaceId,
      sourceEntityType: 'project',
      sourceEntityId: projectId,
      relationshipType: 'contains',
      targetEntityType: 'chat',
      targetEntityId: chatId,
      createdAt: now,
      updatedAt: now,
    });

    // Chat -> Task (derived_from)
    await relationshipRepo.save({
      id: generateEntityId(),
      workspaceId,
      sourceEntityType: 'task',
      sourceEntityId: taskId,
      relationshipType: 'derived_from',
      targetEntityType: 'chat',
      targetEntityId: chatId,
      createdAt: now,
      updatedAt: now,
    });

    const outgoingFromProject = await relationshipRepo.findBySourceEntity('project', projectId);
    expect(outgoingFromProject.length).toBe(1);
    expect(outgoingFromProject[0]?.targetEntityId).toBe(chatId);

    const incomingToChat = await relationshipRepo.findByTargetEntity('chat', chatId);
    expect(incomingToChat.length).toBe(2);
  });

  it('throws NotFoundError on getOrThrow when entity does not exist', async () => {
    await expect(projectRepo.getOrThrow(generateEntityId())).rejects.toThrow(NotFoundError);
  });
});
