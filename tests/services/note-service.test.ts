import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryStorageEngine } from '@/persistence/memory/memory.storage-engine';
import { StorageService } from '@/services/storage.service';
import { NoteService } from '@/services/note.service';
import { WorkspaceService } from '@/services/workspace.service';
import { ProjectService } from '@/services/project.service';
import { EntityId } from '@/types';
import { ValidationError } from '@/utils/errors';

describe('NoteService', () => {
  let storageEngine: MemoryStorageEngine;
  let storageService: StorageService;
  let noteService: NoteService;
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
    noteService = new NoteService(storageService.notes);

    const { workspace } = await workspaceService.getOrCreateDefaultWorkspace();
    workspaceId = workspace.id;

    const project = await projectService.createProject({
      workspaceId,
      name: 'Test Project',
    });
    projectId = project.id;
  });

  it('creates and retrieves a persistent note', async () => {
    const note = await noteService.createNote({
      workspaceId,
      projectId,
      title: 'Meeting Notes',
      content: '## Action Items\n- Finish Phase 9\n- Review test suite',
      tags: ['meeting', 'p9'],
      isPinned: true,
    });

    expect(note.id).toBeDefined();
    expect(note.title).toBe('Meeting Notes');
    expect(note.content).toContain('Finish Phase 9');
    expect(note.isPinned).toBe(true);
    expect(note.tags).toEqual(['meeting', 'p9']);

    const retrieved = await noteService.getNoteOrThrow(note.id, projectId);
    expect(retrieved.id).toBe(note.id);
  });

  it('updates note content and toggles pin status', async () => {
    const note = await noteService.createNote({
      workspaceId,
      projectId,
      title: 'Draft Note',
      content: 'Initial text',
    });

    const updated = await noteService.updateNote(
      note.id,
      {
        title: 'Final Note',
        content: 'Updated content',
      },
      projectId,
    );

    expect(updated.title).toBe('Final Note');
    expect(updated.content).toBe('Updated content');

    const pinned = await noteService.togglePin(note.id, projectId);
    expect(pinned.isPinned).toBe(true);

    const unpinned = await noteService.togglePin(note.id, projectId);
    expect(unpinned.isPinned).toBe(false);
  });

  it('deletes a note', async () => {
    const note = await noteService.createNote({
      workspaceId,
      projectId,
      title: 'To Delete',
      content: 'Delete me',
    });

    const deleted = await noteService.deleteNote(note.id, projectId);
    expect(deleted).toBe(true);

    const found = await noteService.getNote(note.id);
    expect(found).toBeNull();
  });

  it('enforces project isolation on note operations', async () => {
    const otherProject = await projectService.createProject({
      workspaceId,
      name: 'Other Project',
    });

    const note = await noteService.createNote({
      workspaceId,
      projectId,
      title: 'Secret Note',
      content: 'Secret',
    });

    await expect(noteService.getNoteOrThrow(note.id, otherProject.id)).rejects.toThrow(
      ValidationError,
    );
    await expect(
      noteService.updateNote(note.id, { title: 'Hacked' }, otherProject.id),
    ).rejects.toThrow(ValidationError);
    await expect(noteService.deleteNote(note.id, otherProject.id)).rejects.toThrow(ValidationError);
  });
});
