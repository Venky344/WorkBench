import { BaseEntity } from './base.entity';
import { TaskPriority } from './task.entity';

export interface TemplateGroupDefinition {
  readonly name: string;
  readonly description?: string;
  readonly order: number;
}

export interface TemplateTaskDefinition {
  readonly title: string;
  readonly priority: TaskPriority;
  readonly description?: string;
}

/**
 * Reusable blueprint for creating standardized project structures.
 */
export interface ProjectTemplate extends BaseEntity {
  readonly name: string;
  readonly description: string;
  readonly category: string;
  readonly defaultGroups: readonly TemplateGroupDefinition[];
  readonly defaultTasks: readonly TemplateTaskDefinition[];
  readonly defaultTags: readonly string[];
  readonly isBuiltin: boolean;
}
