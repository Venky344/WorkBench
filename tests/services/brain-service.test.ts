import { describe, it, expect, beforeEach } from 'vitest';
import { createServiceContainer, ServiceContainer } from '@/services/container';
import { MemoryStorageEngine } from '@/persistence/memory/memory.storage-engine';
import { BrainService } from '@/services/brain.service';
import { Workspace, Project } from '@/domain/entities';

describe('BrainService — Context Assembly & Relationship Management', () => {
  let container: ServiceContainer;
  let brainService: BrainService;
  let workspace: Workspace;
  let project: Project;

  beforeEach(async () => {
    const memory = new MemoryStorageEngine();
    container = createServiceContainer(memory);
    const init = await container.initialize();
    workspace = init.workspace;
    brainService = container.brainService;

    project = await container.projectService.createProject({
      workspaceId: workspace.id,
      name: 'Brain Core Project',
      description: 'Test project for brain service',
    });
  });

  it('assembles complete project context summary with accurate counts and summaries', async () => {
    const chat = await container.chatService.createChat({
      workspaceId: workspace.id,
      projectId: project.id,
      title: 'Brain Brainstorming',
    });

    await container.noteService.createNote({
      workspaceId: workspace.id,
      projectId: project.id,
      title: 'Context Architecture',
      content: 'Brain notes',
    });

    const task1 = await container.taskService.createTask({
      workspaceId: workspace.id,
      projectId: project.id,
      title: 'Task in progress',
      priority: 'high',
    });
    await container.taskService.updateTaskStatus(task1.id, 'in_progress');

    const task2 = await container.taskService.createTask({
      workspaceId: workspace.id,
      projectId: project.id,
      title: 'Completed task',
      priority: 'low',
    });
    await container.taskService.updateTaskStatus(task2.id, 'done');

    const decision = await container.decisionService.createDecision({
      workspaceId: workspace.id,
      projectId: project.id,
      title: 'ADR-001: Deterministic Brain',
      status: 'accepted',
      decision: 'Use explicit and derived graph traversal',
      rationale: 'Guarantee explainable context without LLM inference',
    });

    // Explicit link between chat and decision
    await brainService.linkEntities({
      workspaceId: workspace.id,
      sourceEntityType: 'chat',
      sourceEntityId: chat.id,
      relationshipType: 'documents',
      targetEntityType: 'decision',
      targetEntityId: decision.id,
    });

    const summary = await brainService.getProjectContext(workspace.id, project.id);

    expect(summary.project.id).toBe(project.id);
    expect(summary.counts.chats).toBe(1);
    expect(summary.counts.notes).toBe(1);
    expect(summary.counts.tasks).toBe(2);
    expect(summary.counts.decisions).toBe(1);
    expect(summary.counts.explicitRelationships).toBe(1);

    expect(summary.tasksSummary.inProgress).toBe(1);
    expect(summary.tasksSummary.done).toBe(1);
    expect(summary.decisionsSummary.accepted).toBe(1);

    expect(summary.recentItems.length).toBeGreaterThanOrEqual(5);
    expect(summary.explicitRelationships).toHaveLength(1);
    expect(summary.explicitRelationships[0]?.relationship.relationshipType).toBe('documents');
  });

  it('throws NotFoundError when requesting context for missing project', async () => {
    await expect(
      brainService.getProjectContext(workspace.id, 'missing-project-id'),
    ).rejects.toThrow();
  });

  it('assembles individual entity context with explicit incoming and outgoing links', async () => {
    const note = await container.noteService.createNote({
      workspaceId: workspace.id,
      projectId: project.id,
      title: 'Source Note',
      content: 'Note content',
    });

    const task = await container.taskService.createTask({
      workspaceId: workspace.id,
      projectId: project.id,
      title: 'Target Task',
      priority: 'medium',
    });

    await brainService.linkEntities({
      workspaceId: workspace.id,
      sourceEntityType: 'note',
      sourceEntityId: note.id,
      relationshipType: 'implements',
      targetEntityType: 'task',
      targetEntityId: task.id,
    });

    // Inspect note context
    const noteContext = await brainService.getEntityContext(workspace.id, 'note', note.id);
    expect(noteContext.target.title).toBe('Source Note');
    expect(noteContext.explicitOutgoing).toHaveLength(1);
    expect(noteContext.explicitOutgoing[0]?.target.title).toBe('Target Task');
    expect(noteContext.explicitIncoming).toHaveLength(0);

    // Inspect task context
    const taskContext = await brainService.getEntityContext(workspace.id, 'task', task.id);
    expect(taskContext.target.title).toBe('Target Task');
    expect(taskContext.explicitOutgoing).toHaveLength(0);
    expect(taskContext.explicitIncoming).toHaveLength(1);
    expect(taskContext.explicitIncoming[0]?.source.title).toBe('Source Note');
  });

  it('validates and rejects self-linking or non-existent entity linking', async () => {
    const note = await container.noteService.createNote({
      workspaceId: workspace.id,
      projectId: project.id,
      title: 'Self Note',
      content: 'Test',
    });

    // Self-link attempt
    await expect(
      brainService.linkEntities({
        workspaceId: workspace.id,
        sourceEntityType: 'note',
        sourceEntityId: note.id,
        relationshipType: 'relates_to',
        targetEntityType: 'note',
        targetEntityId: note.id,
      }),
    ).rejects.toThrow('Cannot link an entity to itself');

    // Missing target entity
    await expect(
      brainService.linkEntities({
        workspaceId: workspace.id,
        sourceEntityType: 'note',
        sourceEntityId: note.id,
        relationshipType: 'relates_to',
        targetEntityType: 'note',
        targetEntityId: 'invalid-id-999',
      }),
    ).rejects.toThrow();
  });

  it('unlinks explicit relationships by ID or endpoint parameters', async () => {
    const chat = await container.chatService.createChat({
      workspaceId: workspace.id,
      projectId: project.id,
      title: 'Chat to unlink',
    });

    const note = await container.noteService.createNote({
      workspaceId: workspace.id,
      projectId: project.id,
      title: 'Note to unlink',
      content: 'unlink me',
    });

    const rel = await brainService.linkEntities({
      workspaceId: workspace.id,
      sourceEntityType: 'chat',
      sourceEntityId: chat.id,
      relationshipType: 'references',
      targetEntityType: 'note',
      targetEntityId: note.id,
    });

    // Unlink by ID
    const unlinked = await brainService.unlinkRelationship(workspace.id, rel.id);
    expect(unlinked).toBe(true);

    const checkContext = await brainService.getEntityContext(workspace.id, 'chat', chat.id);
    expect(checkContext.explicitOutgoing).toHaveLength(0);
  });

  it('cascades deletion of all relationships associated with an entity', async () => {
    const chat = await container.chatService.createChat({
      workspaceId: workspace.id,
      projectId: project.id,
      title: 'Chat for cascade',
    });

    const note1 = await container.noteService.createNote({
      workspaceId: workspace.id,
      projectId: project.id,
      title: 'Target note 1',
      content: '1',
    });

    const note2 = await container.noteService.createNote({
      workspaceId: workspace.id,
      projectId: project.id,
      title: 'Target note 2',
      content: '2',
    });

    await brainService.linkEntities({
      workspaceId: workspace.id,
      sourceEntityType: 'chat',
      sourceEntityId: chat.id,
      relationshipType: 'documents',
      targetEntityType: 'note',
      targetEntityId: note1.id,
    });

    await brainService.linkEntities({
      workspaceId: workspace.id,
      sourceEntityType: 'note',
      sourceEntityId: note2.id,
      relationshipType: 'references',
      targetEntityType: 'chat',
      targetEntityId: chat.id,
    });

    const deletedCount = await brainService.deleteEntityRelationships(
      workspace.id,
      'chat',
      chat.id,
    );
    expect(deletedCount).toBe(2);

    const explicitList = await brainService.listExplicitRelationships(workspace.id, project.id);
    expect(explicitList).toHaveLength(0);
  });

  it('safely handles dangling relationships when an entity was deleted without crashing', async () => {
    const chat = await container.chatService.createChat({
      workspaceId: workspace.id,
      projectId: project.id,
      title: 'Persistent Chat',
    });

    const note = await container.noteService.createNote({
      workspaceId: workspace.id,
      projectId: project.id,
      title: 'Doomed Note',
      content: 'Will be deleted',
    });

    await brainService.linkEntities({
      workspaceId: workspace.id,
      sourceEntityType: 'chat',
      sourceEntityId: chat.id,
      relationshipType: 'references',
      targetEntityType: 'note',
      targetEntityId: note.id,
    });

    // Hard-delete note directly from storage without unlinking to simulate dangling record
    await container.storageService.notes.delete(note.id);

    // Should not throw; should omit the dangling edge
    const context = await brainService.getEntityContext(workspace.id, 'chat', chat.id);
    expect(context.explicitOutgoing).toHaveLength(0);

    const projContext = await brainService.getProjectContext(workspace.id, project.id);
    expect(projContext.explicitRelationships).toHaveLength(0);
  });

  it('preserves relationships across storage engine reinitialization', async () => {
    const memory = new MemoryStorageEngine();
    const container1 = createServiceContainer(memory);
    const { workspace: ws } = await container1.initialize();

    const proj = await container1.projectService.createProject({
      workspaceId: ws.id,
      name: 'Persisted Project',
    });

    const chat = await container1.chatService.createChat({
      workspaceId: ws.id,
      projectId: proj.id,
      title: 'Chat 1',
    });

    const note = await container1.noteService.createNote({
      workspaceId: ws.id,
      projectId: proj.id,
      title: 'Note 1',
      content: 'Content 1',
    });

    await container1.brainService.linkEntities({
      workspaceId: ws.id,
      sourceEntityType: 'chat',
      sourceEntityId: chat.id,
      relationshipType: 'relates_to',
      targetEntityType: 'note',
      targetEntityId: note.id,
    });

    // Create new service container with the exact same memory storage engine instance
    const container2 = createServiceContainer(memory);
    await container2.initialize();

    const summary = await container2.brainService.getProjectContext(ws.id, proj.id);
    expect(summary.counts.explicitRelationships).toBe(1);
    expect(summary.explicitRelationships[0]?.relationship.sourceEntityId).toBe(chat.id);
    expect(summary.explicitRelationships[0]?.relationship.targetEntityId).toBe(note.id);
  });
});
