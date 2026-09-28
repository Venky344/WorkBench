import { BaseService } from './base.service';
import { IProjectRepository } from '@/repositories/contracts/entity-repositories.contract';
import { Project } from '@/domain/entities';
import { generateEntityId } from '@/domain/value-objects/id';
import { createCurrentTimestamp } from '@/domain/value-objects/timestamp';
import { validateNonEmptyString } from '@/domain/validation/entity.validator';
import { EntityId } from '@/types';
import { ValidationError } from '@/utils/errors';

export type ProjectFilter = 'all' | 'active' | 'archived' | 'pinned';
export type ProjectSortBy = 'updatedAt' | 'createdAt' | 'name';

export interface CreateProjectParams {
  workspaceId: EntityId;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  tags?: readonly string[];
  instructions?: string;
}

export interface UpdateProjectParams {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  tags?: readonly string[];
  instructions?: string;
}

export interface ListProjectsOptions {
  filter?: ProjectFilter;
  sortBy?: ProjectSortBy;
  searchQuery?: string;
}

export class ProjectService extends BaseService {
  private readonly projectRepo: IProjectRepository;

  constructor(projectRepo: IProjectRepository) {
    super('ProjectService');
    this.projectRepo = projectRepo;
  }

  /**
   * Retrieve a single project by ID or throw NotFoundError
   */
  async getProject(id: EntityId): Promise<Project> {
    return this.projectRepo.getOrThrow(id);
  }

  /**
   * Find a project by ID, returning null if not found
   */
  async findProject(id: EntityId): Promise<Project | null> {
    return this.projectRepo.findById(id);
  }

  /**
   * List projects for a workspace with flexible filtering, sorting, and searching
   */
  async listProjects(
    workspaceId: EntityId,
    options: ListProjectsOptions = {},
  ): Promise<readonly Project[]> {
    const filter = options.filter ?? 'active';
    let projects: readonly Project[];

    switch (filter) {
      case 'active':
        projects = await this.projectRepo.findActive(workspaceId);
        break;
      case 'archived':
        projects = await this.projectRepo.findArchived(workspaceId);
        break;
      case 'pinned':
        projects = await this.projectRepo.findPinned(workspaceId);
        break;
      case 'all':
      default:
        projects = await this.projectRepo.findByWorkspaceId(workspaceId);
        break;
    }

    // Apply client-side search query filtering if provided
    let result = [...projects];
    if (options.searchQuery && options.searchQuery.trim().length > 0) {
      const q = options.searchQuery.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }

    // Apply sorting
    const sortBy = options.sortBy ?? 'updatedAt';
    result.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'createdAt') {
        return Date.parse(b.createdAt) - Date.parse(a.createdAt);
      }
      // Default: updatedAt descending
      return Date.parse(b.updatedAt) - Date.parse(a.updatedAt);
    });

    return Object.freeze(result);
  }

  /**
   * Create a new project with validated inputs and unique slug generation
   */
  async createProject(params: CreateProjectParams): Promise<Project> {
    const validatedName = validateNonEmptyString(params.name, 'Project name');
    if (validatedName.length > 100) {
      throw new ValidationError('Project name must not exceed 100 characters');
    }

    const exists = await this.projectRepo.existsByName(params.workspaceId, validatedName);
    if (exists) {
      throw new ValidationError(
        `A project named "${validatedName}" already exists in this workspace.`,
      );
    }

    const baseSlug = this.generateSlug(validatedName);
    const slug = await this.resolveUniqueSlug(params.workspaceId, baseSlug);
    const now = createCurrentTimestamp();
    const existingCount = await this.projectRepo.count();

    const project: Project = {
      id: generateEntityId(),
      workspaceId: params.workspaceId,
      name: validatedName,
      slug,
      description: params.description?.trim() || undefined,
      color: params.color || 'blue',
      icon: params.icon || 'folder',
      instructions: params.instructions?.trim() || undefined,
      isArchived: false,
      isPinned: false,
      order: existingCount,
      tags: Object.freeze(params.tags ? [...params.tags] : []),
      createdAt: now,
      updatedAt: now,
    };

    const saved = await this.projectRepo.save(project);
    this.log.info(`Project created: ${saved.name} (${saved.id}) [${saved.slug}]`);
    return saved;
  }

  /**
   * Update an existing project's metadata
   */
  async updateProject(id: EntityId, params: UpdateProjectParams): Promise<Project> {
    const current = await this.projectRepo.getOrThrow(id);
    let newName = current.name;
    let newSlug = current.slug;

    if (params.name !== undefined) {
      newName = validateNonEmptyString(params.name, 'Project name');
      if (newName.length > 100) {
        throw new ValidationError('Project name must not exceed 100 characters');
      }

      if (newName.toLowerCase() !== current.name.toLowerCase()) {
        const exists = await this.projectRepo.existsByName(current.workspaceId, newName, id);
        if (exists) {
          throw new ValidationError(
            `A project named "${newName}" already exists in this workspace.`,
          );
        }
        const baseSlug = this.generateSlug(newName);
        newSlug = await this.resolveUniqueSlug(current.workspaceId, baseSlug, id);
      }
    }

    const now = createCurrentTimestamp();
    const updated: Project = {
      ...current,
      name: newName,
      slug: newSlug,
      description:
        params.description !== undefined
          ? params.description.trim() || undefined
          : current.description,
      color: params.color !== undefined ? params.color : current.color,
      icon: params.icon !== undefined ? params.icon : current.icon,
      instructions:
        params.instructions !== undefined
          ? params.instructions.trim() || undefined
          : current.instructions,
      tags: params.tags !== undefined ? Object.freeze([...params.tags]) : current.tags,
      updatedAt: now,
    };

    const saved = await this.projectRepo.save(updated);
    this.log.info(`Project updated: ${saved.name} (${saved.id})`);
    return saved;
  }

  /**
   * Toggle or set the pinned / favorite state of a project
   */
  async setPinned(id: EntityId, isPinned: boolean): Promise<Project> {
    const current = await this.projectRepo.getOrThrow(id);
    const updated: Project = {
      ...current,
      isPinned,
      updatedAt: createCurrentTimestamp(),
    };
    return this.projectRepo.save(updated);
  }

  /**
   * Pin a project
   */
  async pinProject(id: EntityId): Promise<Project> {
    return this.setPinned(id, true);
  }

  /**
   * Unpin a project
   */
  async unpinProject(id: EntityId): Promise<Project> {
    return this.setPinned(id, false);
  }

  /**
   * Archive a project without deleting any data
   */
  async archiveProject(id: EntityId): Promise<Project> {
    const current = await this.projectRepo.getOrThrow(id);
    const now = createCurrentTimestamp();
    const updated: Project = {
      ...current,
      isArchived: true,
      archivedAt: now,
      isPinned: false, // Pinned status cleared when archived
      updatedAt: now,
    };
    this.log.info(`Project archived: ${current.name} (${current.id})`);
    return this.projectRepo.save(updated);
  }

  /**
   * Restore an archived project back to active status
   */
  async restoreProject(id: EntityId): Promise<Project> {
    const current = await this.projectRepo.getOrThrow(id);
    const now = createCurrentTimestamp();
    const updated: Project = {
      ...current,
      isArchived: false,
      archivedAt: undefined,
      updatedAt: now,
    };
    this.log.info(`Project restored: ${current.name} (${current.id})`);
    return this.projectRepo.save(updated);
  }

  /**
   * Explicitly delete a project entity
   */
  async deleteProject(id: EntityId): Promise<boolean> {
    const current = await this.projectRepo.getOrThrow(id);
    const deleted = await this.projectRepo.delete(id);
    if (deleted) {
      this.log.info(`Project deleted: ${current.name} (${id})`);
    }
    return deleted;
  }

  /**
   * Generate URL-friendly slug from project name
   */
  private generateSlug(name: string): string {
    return (
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || 'project'
    );
  }

  /**
   * Ensure slug is unique within the workspace
   */
  private async resolveUniqueSlug(
    workspaceId: EntityId,
    baseSlug: string,
    excludeId?: EntityId,
  ): Promise<string> {
    let candidate = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await this.projectRepo.findBySlug(candidate);
      if (
        !existing ||
        (excludeId && existing.id === excludeId) ||
        existing.workspaceId !== workspaceId
      ) {
        return candidate;
      }
      counter++;
      candidate = `${baseSlug}-${counter}`;
    }
  }
}
