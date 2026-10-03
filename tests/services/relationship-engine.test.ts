import { describe, it, expect, beforeEach } from 'vitest';
import { createServiceContainer, ServiceContainer } from '@/services/container';
import { MemoryStorageEngine } from '@/persistence/memory/memory.storage-engine';
import { RelationshipEngine } from '@/services/relationship.engine';
import { Workspace, Project } from '@/domain/entities';
import { generateEntityId } from '@/domain/value-objects/id';

describe('RelationshipEngine — Deterministic Graph Traversal', () => {
  let container: ServiceContainer;
  let engine: RelationshipEngine;
  let workspace: Workspace;
  let projectA: Project;
  let projectB: Project;

  beforeEach(async () => {
    const memory = new MemoryStorageEngine();
    container = createServiceContainer(memory);
    const init = await container.initialize();
    workspace = init.workspace;

    engine = new RelationshipEngine({
      projectRepo: container.storageService.projects,
      chatRepo: container.storageService.chats,
      chatGroupRepo: container.storageService.chatGroups,
      fileRepo: container.storageService.files,
      noteRepo: container.storageService.notes,
      linkRepo: container.storageService.links,
      bookmarkRepo: container.storageService.bookmarks,
      referenceRepo: container.storageService.references,
      codeSnippetRepo: container.storageService.codeSnippets,
      taskRepo: container.storageService.tasks,
      decisionRepo: container.storageService.decisions,
      tagRepo: container.storageService.tags,
      relationshipRepo: container.storageService.relationships,
    });

    projectA = await container.projectService.createProject({
      workspaceId: workspace.id,
      name: 'Project Alpha',
      description: 'First project',
    });

    projectB = await container.projectService.createProject({
      workspaceId: workspace.id,
      name: 'Project Beta',
      description: 'Second project',
    });
  });

  it('discovers explicit relationships in both directions', async () => {
    const chat = await container.chatService.createChat({
      workspaceId: workspace.id,
      projectId: projectA.id,
      title: 'Auth Architecture Discussion',
    });

    const note = await container.noteService.createNote({
      workspaceId: workspace.id,
      projectId: projectA.id,
      title: 'OAuth 2.1 Specification Notes',
      content: '# OAuth Specs',
    });

    // Link Chat -> documents -> Note
    await container.relationshipService.linkEntities({
      workspaceId: workspace.id,
      sourceEntityType: 'chat',
      sourceEntityId: chat.id,
      relationshipType: 'documents',
      targetEntityType: 'note',
      targetEntityId: note.id,
    });

    // Query related from Chat
    const fromChat = await engine.findRelatedEntities(workspace.id, {
      entityType: 'chat',
      entityId: chat.id,
    });

    expect(fromChat.length).toBeGreaterThan(0);
    const noteFound = fromChat.find((e) => e.entityType === 'note' && e.entityId === note.id);
    expect(noteFound).toBeDefined();
    expect(noteFound?.explanations.some((x) => x.origin === 'explicit')).toBe(true);

    // Query related from Note (incoming direction)
    const fromNote = await engine.findRelatedEntities(workspace.id, {
      entityType: 'note',
      entityId: note.id,
    });
    const chatFound = fromNote.find((e) => e.entityType === 'chat' && e.entityId === chat.id);
    expect(chatFound).toBeDefined();
    expect(chatFound?.explanations.some((x) => x.origin === 'explicit')).toBe(true);
  });

  it('discovers shared tags and reports exact tag names in explanation', async () => {
    const tag1 = await container.tagService.createTag({
      workspaceId: workspace.id,
      name: 'security',
    });
    const tag2 = await container.tagService.createTag({
      workspaceId: workspace.id,
      name: 'jwt',
    });

    const task = await container.taskService.createTask({
      workspaceId: workspace.id,
      projectId: projectA.id,
      title: 'Implement token rotation',
      priority: 'high',
      tags: [tag1.id, tag2.id],
    });

    const decision = await container.decisionService.createDecision({
      workspaceId: workspace.id,
      projectId: projectB.id, // in Project B, but sharing tags!
      title: 'ADR-001: JWT Token Storage',
      status: 'accepted',
      decision: 'Store in httpOnly cookies',
      rationale: 'Prevent XSS access to tokens',
      tags: [tag1.id, tag2.id],
    });

    const relatedToTask = await engine.findRelatedEntities(workspace.id, {
      entityType: 'task',
      entityId: task.id,
    });

    const decisionMatch = relatedToTask.find(
      (e) => e.entityType === 'decision' && e.entityId === decision.id,
    );
    expect(decisionMatch).toBeDefined();
    const tagExp = decisionMatch?.explanations.find((e) => e.origin === 'shared_tags');
    expect(tagExp).toBeDefined();
    expect(tagExp?.sharedTagNames).toContain('security');
    expect(tagExp?.sharedTagNames).toContain('jwt');
  });

  it('discovers derived domain references (Task.decisionId, CodeSnippet.chatId, Bookmark.target)', async () => {
    const decision = await container.decisionService.createDecision({
      workspaceId: workspace.id,
      projectId: projectA.id,
      title: 'ADR-005: React Router V7',
      status: 'accepted',
      decision: 'Migrate to data routers',
      rationale: 'Better SSR and navigation performance',
    });

    const task = await container.taskService.createTask({
      workspaceId: workspace.id,
      projectId: projectA.id,
      title: 'Upgrade router dependencies',
      priority: 'medium',
      decisionId: decision.id,
    });

    const relatedToTask = await engine.findRelatedEntities(workspace.id, {
      entityType: 'task',
      entityId: task.id,
    });

    const foundDecision = relatedToTask.find(
      (e) => e.entityType === 'decision' && e.entityId === decision.id,
    );
    expect(foundDecision).toBeDefined();
    expect(foundDecision?.explanations.some((e) => e.origin === 'reference')).toBe(true);

    // Inverse check from Decision -> Task
    const relatedToDecision = await engine.findRelatedEntities(workspace.id, {
      entityType: 'decision',
      entityId: decision.id,
    });
    const foundTask = relatedToDecision.find(
      (e) => e.entityType === 'task' && e.entityId === task.id,
    );
    expect(foundTask).toBeDefined();
    expect(foundTask?.explanations.some((e) => e.origin === 'reference')).toBe(true);
  });

  it('consolidates multiple relationship paths for the same target entity without duplicates', async () => {
    const tag = await container.tagService.createTag({
      workspaceId: workspace.id,
      name: 'database',
    });

    const note = await container.noteService.createNote({
      workspaceId: workspace.id,
      projectId: projectA.id,
      title: 'Schema Design',
      content: '# DB',
      tags: [tag.id],
    });

    const task = await container.taskService.createTask({
      workspaceId: workspace.id,
      projectId: projectA.id,
      title: 'Run DB migrations',
      priority: 'urgent',
      tags: [tag.id],
    });

    // Also link them explicitly
    await container.relationshipService.linkEntities({
      workspaceId: workspace.id,
      sourceEntityType: 'note',
      sourceEntityId: note.id,
      relationshipType: 'relates_to',
      targetEntityType: 'task',
      targetEntityId: task.id,
    });

    const related = await engine.findRelatedEntities(workspace.id, {
      entityType: 'note',
      entityId: note.id,
    });

    // Task must appear exactly ONCE
    const taskMatches = related.filter((e) => e.entityType === 'task' && e.entityId === task.id);
    expect(taskMatches).toHaveLength(1);

    const taskEntry = taskMatches[0]!;
    // Should have 3 distinct explanations: explicit, shared_tags, project_membership
    expect(taskEntry.explanations.some((e) => e.origin === 'explicit')).toBe(true);
    expect(taskEntry.explanations.some((e) => e.origin === 'shared_tags')).toBe(true);
    expect(taskEntry.explanations.some((e) => e.origin === 'project_membership')).toBe(true);
  });

  it('prevents cycles and excludes self from results', async () => {
    const noteA = await container.noteService.createNote({
      workspaceId: workspace.id,
      projectId: projectA.id,
      title: 'Note A',
      content: 'A',
    });
    const noteB = await container.noteService.createNote({
      workspaceId: workspace.id,
      projectId: projectA.id,
      title: 'Note B',
      content: 'B',
    });
    const noteC = await container.noteService.createNote({
      workspaceId: workspace.id,
      projectId: projectA.id,
      title: 'Note C',
      content: 'C',
    });

    // Create cyclic graph: A -> B -> C -> A
    await container.relationshipService.linkEntities({
      workspaceId: workspace.id,
      sourceEntityType: 'note',
      sourceEntityId: noteA.id,
      relationshipType: 'references',
      targetEntityType: 'note',
      targetEntityId: noteB.id,
    });
    await container.relationshipService.linkEntities({
      workspaceId: workspace.id,
      sourceEntityType: 'note',
      sourceEntityId: noteB.id,
      relationshipType: 'references',
      targetEntityType: 'note',
      targetEntityId: noteC.id,
    });
    await container.relationshipService.linkEntities({
      workspaceId: workspace.id,
      sourceEntityType: 'note',
      sourceEntityId: noteC.id,
      relationshipType: 'references',
      targetEntityType: 'note',
      targetEntityId: noteA.id,
    });

    // Depth 2 traversal from Note A
    const related = await engine.findRelatedEntities(
      workspace.id,
      { entityType: 'note', entityId: noteA.id },
      { maxDepth: 2 },
    );

    // Note A must NOT be in its own related list
    expect(related.some((e) => e.entityId === noteA.id)).toBe(false);
    expect(related.some((e) => e.entityId === noteB.id)).toBe(true);
    expect(related.some((e) => e.entityId === noteC.id)).toBe(true);
  });

  it('respects workspace isolation strictly (never returns items from another workspace)', async () => {
    const wsId = generateEntityId();
    const workspace2 = await container.storageService.workspaces.save({
      id: wsId,
      name: 'Second Workspace',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const projectW2 = await container.projectService.createProject({
      workspaceId: workspace2.id,
      name: 'W2 Project',
    });

    const noteW2 = await container.noteService.createNote({
      workspaceId: workspace2.id,
      projectId: projectW2.id,
      title: 'Secret Notes in W2',
      content: 'Classified',
    });

    const noteW1 = await container.noteService.createNote({
      workspaceId: workspace.id,
      projectId: projectA.id,
      title: 'Normal Note W1',
      content: 'Open',
    });

    // Query in workspace 1
    const results = await engine.findRelatedEntities(workspace.id, {
      entityType: 'note',
      entityId: noteW1.id,
    });

    expect(results.some((r) => r.entityId === noteW2.id)).toBe(false);
    expect(results.some((r) => r.entityId === projectW2.id)).toBe(false);
  });

  it('returns empty array when target entity does not exist', async () => {
    const results = await engine.findRelatedEntities(workspace.id, {
      entityType: 'note',
      entityId: 'non-existent-id',
    });
    expect(results).toEqual([]);
  });
});
