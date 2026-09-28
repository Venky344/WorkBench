import { BaseService } from './base.service';
import { ITaskRepository } from '@/repositories/contracts/entity-repositories.contract';
import { Task, TaskPriority, TaskStatus } from '@/domain/entities';
import { generateEntityId } from '@/domain/value-objects/id';
import { createCurrentTimestamp } from '@/domain/value-objects/timestamp';
import { validateNonEmptyString } from '@/domain/validation/entity.validator';
import { EntityId, ISOTimestamp } from '@/types';

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
      description: params.description,
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

    return this.taskRepo.save(task);
  }

  async updateTaskStatus(taskId: EntityId, status: TaskStatus): Promise<Task> {
    const task = await this.taskRepo.getOrThrow(taskId);
    const now = createCurrentTimestamp();
    const updated: Task = {
      ...task,
      status,
      completedAt: status === 'done' ? now : undefined,
      updatedAt: now,
    };
    return this.taskRepo.save(updated);
  }
}
