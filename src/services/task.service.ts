import { BaseService } from './base.service';
import { ITaskRepository } from '@/repositories/contracts/entity-repositories.contract';
import { Task, TaskPriority, TaskStatus } from '@/domain/entities';
import { generateEntityId } from '@/domain/value-objects/id';
import { createCurrentTimestamp } from '@/domain/value-objects/timestamp';
import { validateNonEmptyString } from '@/domain/validation/entity.validator';
import { EntityId, ISOTimestamp } from '@/types';
import { NotFoundError, ValidationError } from '@/utils/errors';

export interface TaskFilterOptions {
  readonly status?: TaskStatus;
  readonly priority?: TaskPriority;
  readonly tagId?: EntityId;
}

export class TaskService extends BaseService {
  private readonly taskRepo: ITaskRepository;

  constructor(taskRepo: ITaskRepository) {
    super('TaskService');
    this.taskRepo = taskRepo;
  }

  async createTask(params: {
    workspaceId: EntityId;
    projectId: EntityId;
    title: string;
    description?: string;
    priority?: TaskPriority;
    dueDate?: ISOTimestamp;
    sourceChatId?: EntityId;
    sourceMessageId?: EntityId;
    decisionId?: EntityId;
    tags?: readonly string[];
  }): Promise<Task> {
    const title = validateNonEmptyString(params.title, 'Task title');
    const now = createCurrentTimestamp();
    const existing = await this.taskRepo.findByProjectId(params.projectId);

    const task: Task = {
      id: generateEntityId(),
      workspaceId: params.workspaceId,
      projectId: params.projectId,
      title,
      description: params.description?.trim() || undefined,
      status: 'todo',
      priority: params.priority ?? 'medium',
      dueDate: params.dueDate,
      sourceChatId: params.sourceChatId,
      sourceMessageId: params.sourceMessageId,
      decisionId: params.decisionId,
      order: existing.length,
      tags: Object.freeze(params.tags ? [...params.tags] : []),
      createdAt: now,
      updatedAt: now,
    };

    const saved = await this.taskRepo.save(task);
    this.log.info(`Task created: "${saved.title}" (${saved.id}) in project ${saved.projectId}`);
    return saved;
  }

  async getTask(taskId: EntityId): Promise<Task | null> {
    return this.taskRepo.findById(taskId);
  }

  async getTaskOrThrow(taskId: EntityId, expectedProjectId?: EntityId): Promise<Task> {
    const task = await this.taskRepo.findById(taskId);
    if (!task) {
      throw new NotFoundError('Task', taskId);
    }
    if (expectedProjectId && task.projectId !== expectedProjectId) {
      throw new ValidationError(`Task does not belong to project "${expectedProjectId}"`);
    }
    return task;
  }

  async updateTask(
    taskId: EntityId,
    updates: {
      title?: string;
      description?: string | null;
      priority?: TaskPriority;
      dueDate?: ISOTimestamp | null;
      tags?: readonly string[];
      order?: number;
    },
    expectedProjectId?: EntityId,
  ): Promise<Task> {
    const existing = await this.getTaskOrThrow(taskId, expectedProjectId);

    let title = existing.title;
    if (updates.title !== undefined) {
      title = validateNonEmptyString(updates.title, 'Task title');
    }

    const now = createCurrentTimestamp();
    const updated: Task = {
      ...existing,
      title,
      description:
        updates.description !== undefined
          ? updates.description?.trim() || undefined
          : existing.description,
      priority: updates.priority ?? existing.priority,
      dueDate: updates.dueDate !== undefined ? updates.dueDate || undefined : existing.dueDate,
      tags: updates.tags !== undefined ? Object.freeze([...updates.tags]) : existing.tags,
      order: updates.order !== undefined ? updates.order : existing.order,
      updatedAt: now,
    };

    const saved = await this.taskRepo.save(updated);
    this.log.info(`Task updated: "${saved.title}" (${saved.id})`);
    return saved;
  }

  async updateTaskStatus(
    taskId: EntityId,
    status: TaskStatus,
    expectedProjectId?: EntityId,
  ): Promise<Task> {
    const task = await this.getTaskOrThrow(taskId, expectedProjectId);
    const now = createCurrentTimestamp();
    const updated: Task = {
      ...task,
      status,
      completedAt: status === 'done' ? now : undefined,
      updatedAt: now,
    };
    const saved = await this.taskRepo.save(updated);
    this.log.info(`Task status changed: "${saved.title}" -> ${status}`);
    return saved;
  }

  async toggleComplete(taskId: EntityId, expectedProjectId?: EntityId): Promise<Task> {
    const task = await this.getTaskOrThrow(taskId, expectedProjectId);
    const newStatus: TaskStatus = task.status === 'done' ? 'todo' : 'done';
    return this.updateTaskStatus(taskId, newStatus, expectedProjectId);
  }

  async reopenTask(taskId: EntityId, expectedProjectId?: EntityId): Promise<Task> {
    return this.updateTaskStatus(taskId, 'todo', expectedProjectId);
  }

  async deleteTask(taskId: EntityId, expectedProjectId?: EntityId): Promise<boolean> {
    const task = await this.getTaskOrThrow(taskId, expectedProjectId);
    const deleted = await this.taskRepo.delete(taskId);
    this.log.info(`Task deleted: "${task.title}" (${taskId})`);
    return deleted;
  }

  async listTasksByProject(
    projectId: EntityId,
    options?: TaskFilterOptions,
  ): Promise<readonly Task[]> {
    const tasks = await this.taskRepo.findByProjectId(projectId);
    return this.filterTasks(tasks, options);
  }

  async listTasksByWorkspace(
    workspaceId: EntityId,
    options?: TaskFilterOptions,
  ): Promise<readonly Task[]> {
    const tasks = await this.taskRepo.findByWorkspaceId(workspaceId);
    return this.filterTasks(tasks, options);
  }

  private filterTasks(tasks: readonly Task[], options?: TaskFilterOptions): readonly Task[] {
    let filtered = [...tasks];

    if (options?.status) {
      filtered = filtered.filter((t) => t.status === options.status);
    }

    if (options?.priority) {
      filtered = filtered.filter((t) => t.priority === options.priority);
    }

    if (options?.tagId) {
      filtered = filtered.filter((t) => t.tags && t.tags.includes(options.tagId!));
    }

    return Object.freeze(
      filtered.sort((a, b) => {
        // Sort by order ascending if different, otherwise created timestamp descending
        if (a.order !== b.order) {
          return a.order - b.order;
        }
        return b.createdAt.localeCompare(a.createdAt);
      }),
    );
  }
}
