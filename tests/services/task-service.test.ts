import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryStorageEngine } from '@/persistence/memory/memory.storage-engine';
import { StorageService } from '@/services/storage.service';
import { TaskService } from '@/services/task.service';
import { WorkspaceService } from '@/services/workspace.service';
import { ProjectService } from '@/services/project.service';
import { EntityId } from '@/types';
import { NotFoundError, ValidationError } from '@/utils/errors';

describe('TaskService', () => {
  let storageEngine: MemoryStorageEngine;
  let storageService: StorageService;
  let taskService: TaskService;
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
    taskService = new TaskService(storageService.tasks);

    const { workspace } = await workspaceService.getOrCreateDefaultWorkspace();
    workspaceId = workspace.id;

    const project = await projectService.createProject({
      workspaceId,
      name: 'Task Management Project',
    });
    projectId = project.id;
  });

  describe('CRUD operations', () => {
    it('creates and retrieves a persistent task', async () => {
      const task = await taskService.createTask({
        workspaceId,
        projectId,
        title: 'Implement Task CRUD',
        description: 'Complete all service methods and unit tests',
        priority: 'high',
        dueDate: '2026-10-15T00:00:00.000Z',
        tags: ['tag-1', 'tag-2'],
      });

      expect(task.id).toBeDefined();
      expect(task.title).toBe('Implement Task CRUD');
      expect(task.description).toBe('Complete all service methods and unit tests');
      expect(task.priority).toBe('high');
      expect(task.status).toBe('todo');
      expect(task.dueDate).toBe('2026-10-15T00:00:00.000Z');
      expect(task.tags).toEqual(['tag-1', 'tag-2']);
      expect(task.completedAt).toBeUndefined();

      const retrieved = await taskService.getTaskOrThrow(task.id, projectId);
      expect(retrieved.id).toBe(task.id);
      expect(retrieved.title).toBe(task.title);
    });

    it('updates task fields including title, description, priority, dueDate, and tags', async () => {
      const task = await taskService.createTask({
        workspaceId,
        projectId,
        title: 'Initial Task',
        priority: 'low',
      });

      const updated = await taskService.updateTask(
        task.id,
        {
          title: 'Updated Task Title',
          description: 'Added detailed description',
          priority: 'urgent',
          dueDate: '2026-11-01T12:00:00.000Z',
          tags: ['backend', 'perf'],
        },
        projectId,
      );

      expect(updated.title).toBe('Updated Task Title');
      expect(updated.description).toBe('Added detailed description');
      expect(updated.priority).toBe('urgent');
      expect(updated.dueDate).toBe('2026-11-01T12:00:00.000Z');
      expect(updated.tags).toEqual(['backend', 'perf']);
    });

    it('deletes a task successfully', async () => {
      const task = await taskService.createTask({
        workspaceId,
        projectId,
        title: 'Temporary Task',
      });

      const deleted = await taskService.deleteTask(task.id, projectId);
      expect(deleted).toBe(true);

      const found = await taskService.getTask(task.id);
      expect(found).toBeNull();
      await expect(taskService.getTaskOrThrow(task.id)).rejects.toThrow(NotFoundError);
    });
  });

  describe('Completion and Reopening lifecycle', () => {
    it('completes and reopens a task with timestamp updates', async () => {
      const task = await taskService.createTask({
        workspaceId,
        projectId,
        title: 'Complete Lifecycle Test',
      });

      expect(task.status).toBe('todo');
      expect(task.completedAt).toBeUndefined();

      const completed = await taskService.toggleComplete(task.id, projectId);
      expect(completed.status).toBe('done');
      expect(completed.completedAt).toBeDefined();

      const reopened = await taskService.toggleComplete(task.id, projectId);
      expect(reopened.status).toBe('todo');
      expect(reopened.completedAt).toBeUndefined();

      const finished = await taskService.updateTaskStatus(task.id, 'done', projectId);
      expect(finished.status).toBe('done');
      expect(finished.completedAt).toBeDefined();

      const reopenedExplicit = await taskService.reopenTask(task.id, projectId);
      expect(reopenedExplicit.status).toBe('todo');
      expect(reopenedExplicit.completedAt).toBeUndefined();
    });

    it('handles in_progress and cancelled status transitions properly', async () => {
      const task = await taskService.createTask({
        workspaceId,
        projectId,
        title: 'Multi-state Lifecycle',
      });

      // Move to in_progress
      const inProg = await taskService.updateTaskStatus(task.id, 'in_progress', projectId);
      expect(inProg.status).toBe('in_progress');
      expect(inProg.completedAt).toBeUndefined();

      // toggleComplete from in_progress marks done
      const completedFromInProg = await taskService.toggleComplete(task.id, projectId);
      expect(completedFromInProg.status).toBe('done');
      expect(completedFromInProg.completedAt).toBeDefined();

      // Transition to cancelled clears completedAt
      const cancelled = await taskService.updateTaskStatus(task.id, 'cancelled', projectId);
      expect(cancelled.status).toBe('cancelled');
      expect(cancelled.completedAt).toBeUndefined();
    });
  });

  describe('Filtering and Listing', () => {
    it('lists and filters tasks by project, status, priority, and tag', async () => {
      await taskService.createTask({
        workspaceId,
        projectId,
        title: 'Task 1',
        priority: 'high',
        tags: ['frontend'],
      });

      const task2 = await taskService.createTask({
        workspaceId,
        projectId,
        title: 'Task 2',
        priority: 'medium',
        tags: ['backend'],
      });
      await taskService.updateTaskStatus(task2.id, 'done', projectId);

      await taskService.createTask({
        workspaceId,
        projectId,
        title: 'Task 3',
        priority: 'high',
        tags: ['backend'],
      });

      const allProjectTasks = await taskService.listTasksByProject(projectId);
      expect(allProjectTasks.length).toBe(3);

      const highPriorityTasks = await taskService.listTasksByProject(projectId, {
        priority: 'high',
      });
      expect(highPriorityTasks.length).toBe(2);

      const doneTasks = await taskService.listTasksByProject(projectId, {
        status: 'done',
      });
      expect(doneTasks.length).toBe(1);
      expect(doneTasks[0]?.id).toBe(task2.id);

      const backendTasks = await taskService.listTasksByProject(projectId, {
        tagId: 'backend',
      });
      expect(backendTasks.length).toBe(2);
    });

    it('verifies overdue derivation logic', async () => {
      const { isTaskOverdue } = await import('@/components/tasks/task-utils');

      // Past due date
      const pastTask = await taskService.createTask({
        workspaceId,
        projectId,
        title: 'Past Task',
        dueDate: '2020-01-01T00:00:00.000Z',
      });
      expect(isTaskOverdue(pastTask)).toBe(true);

      // Past due date but completed
      const doneTask = await taskService.updateTaskStatus(pastTask.id, 'done', projectId);
      expect(isTaskOverdue(doneTask)).toBe(false);

      // Past due date but cancelled
      const cancelledTask = await taskService.updateTaskStatus(pastTask.id, 'cancelled', projectId);
      expect(isTaskOverdue(cancelledTask)).toBe(false);

      // Future due date
      const futureTask = await taskService.createTask({
        workspaceId,
        projectId,
        title: 'Future Task',
        dueDate: '2099-01-01T00:00:00.000Z',
      });
      expect(isTaskOverdue(futureTask)).toBe(false);

      // No due date
      const noDueDateTask = await taskService.createTask({
        workspaceId,
        projectId,
        title: 'No Due Date',
      });
      expect(isTaskOverdue(noDueDateTask)).toBe(false);
    });

    it('lists tasks across workspace', async () => {
      const otherProject = await projectService.createProject({
        workspaceId,
        name: 'Project B',
      });

      await taskService.createTask({
        workspaceId,
        projectId,
        title: 'Task in Project A',
      });

      await taskService.createTask({
        workspaceId,
        projectId: otherProject.id,
        title: 'Task in Project B',
      });

      const workspaceTasks = await taskService.listTasksByWorkspace(workspaceId);
      expect(workspaceTasks.length).toBe(2);
    });
  });

  describe('Isolation and Error Handling', () => {
    it('enforces project isolation on task operations', async () => {
      const otherProject = await projectService.createProject({
        workspaceId,
        name: 'Foreign Project',
      });

      const task = await taskService.createTask({
        workspaceId,
        projectId,
        title: 'Isolated Task',
      });

      await expect(taskService.getTaskOrThrow(task.id, otherProject.id)).rejects.toThrow(
        ValidationError,
      );
      await expect(
        taskService.updateTask(task.id, { title: 'Hijacked' }, otherProject.id),
      ).rejects.toThrow(ValidationError);
      await expect(taskService.deleteTask(task.id, otherProject.id)).rejects.toThrow(
        ValidationError,
      );
      await expect(taskService.toggleComplete(task.id, otherProject.id)).rejects.toThrow(
        ValidationError,
      );
    });

    it('validates task title is non-empty', async () => {
      await expect(
        taskService.createTask({
          workspaceId,
          projectId,
          title: '   ',
        }),
      ).rejects.toThrow(ValidationError);
    });
  });
});
