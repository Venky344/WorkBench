import { BaseService } from './base.service';
import { IProjectRepository } from '@/repositories/contracts/entity-repositories.contract';
import { Project } from '@/domain/entities';
import { generateEntityId } from '@/domain/value-objects/id';
import { createCurrentTimestamp } from '@/domain/value-objects/timestamp';
import { validateNonEmptyString } from '@/domain/validation/entity.validator';
import { EntityId } from '@/types';

export class ProjectService extends BaseService {
  private readonly projectRepo: IProjectRepository;

  constructor(projectRepo: IProjectRepository) {
    super('ProjectService');
    this.projectRepo = projectRepo;
  }

  async getProject(id: EntityId): Promise<Project> {
    return this.projectRepo.getOrThrow(id);
  }

  async getProjectsByWorkspace(
    workspaceId: EntityId,
    includeArchived = false,
  ): Promise<readonly Project[]> {
    if (includeArchived) {
      return this.projectRepo.findByWorkspaceId(workspaceId);
    }
    return this.projectRepo.findActive(workspaceId);
  }

  async createProject(params: {
    workspaceId: EntityId;
    name: string;
    description?: string;
    color?: string;
    icon?: string;
    tags?: readonly string[];
  }): Promise<Project> {
    const validatedName = validateNonEmptyString(params.name, 'Project name');
    const slug =
      validatedName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || 'project';
    const now = createCurrentTimestamp();

    const existingCount = await this.projectRepo.count();

    const project: Project = {
      id: generateEntityId(),
      workspaceId: params.workspaceId,
      name: validatedName,
      slug,
      description: params.description,
      color: params.color,
      icon: params.icon,
      isArchived: false,
      isPinned: false,
      order: existingCount,
      tags: Object.freeze(params.tags ? [...params.tags] : []),
      createdAt: now,
      updatedAt: now,
    };

    const saved = await this.projectRepo.save(project);
    this.log.info(`Project created: ${saved.name} (${saved.id})`);
    return saved;
  }
}
