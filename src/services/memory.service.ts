import { BaseService } from './base.service';
import {
  IMemoryRepository,
  IProjectRepository,
  IChatRepository,
  INoteRepository,
  IFileRepository,
  ITaskRepository,
  IDecisionRepository,
  ILinkRepository,
  IBookmarkRepository,
  IReferenceRepository,
  ICodeSnippetRepository,
} from '@/repositories/contracts/entity-repositories.contract';
import { MemoryItem, MemoryType, MemoryImportance, MemorySourceReference } from '@/domain/entities';
import {
  CreateMemoryInput,
  UpdateMemoryInput,
  MemoryFilterOptions,
  ProjectMemoryContext,
  ResolvedMemorySource,
  isMemoryDueForReview,
} from '@/domain/memory';
import { generateEntityId } from '@/domain/value-objects/id';
import { createCurrentTimestamp } from '@/domain/value-objects/timestamp';
import { validateNonEmptyString, validateEntityType } from '@/domain/validation/entity.validator';
import { EntityId } from '@/types';
import { NotFoundError, ValidationError } from '@/utils/errors';

export interface MemoryServiceDependencies {
  readonly memoryRepo: IMemoryRepository;
  readonly projectRepo: IProjectRepository;
  readonly chatRepo?: IChatRepository;
  readonly noteRepo?: INoteRepository;
  readonly fileRepo?: IFileRepository;
  readonly taskRepo?: ITaskRepository;
  readonly decisionRepo?: IDecisionRepository;
  readonly linkRepo?: ILinkRepository;
  readonly bookmarkRepo?: IBookmarkRepository;
  readonly referenceRepo?: IReferenceRepository;
  readonly codeSnippetRepo?: ICodeSnippetRepository;
  readonly snippetRepo?: ICodeSnippetRepository;
}

const VALID_MEMORY_TYPES: ReadonlySet<MemoryType> = new Set<MemoryType>([
  'fact',
  'goal',
  'constraint',
  'preference',
  'decision',
  'key_context',
  'note',
]);

const VALID_MEMORY_IMPORTANCES: ReadonlySet<MemoryImportance> = new Set<MemoryImportance>([
  'low',
  'medium',
  'high',
  'critical',
]);

const IMPORTANCE_WEIGHTS: Record<MemoryImportance, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

export class MemoryService extends BaseService {
  private readonly memoryRepo: IMemoryRepository;
  private readonly deps: Omit<MemoryServiceDependencies, 'memoryRepo'>;

  constructor(
    memoryRepoOrDeps: IMemoryRepository | MemoryServiceDependencies,
    optionalDeps?: Omit<MemoryServiceDependencies, 'memoryRepo'>,
  ) {
    super('MemoryService');
    if ('memoryRepo' in memoryRepoOrDeps) {
      this.memoryRepo = memoryRepoOrDeps.memoryRepo;
      this.deps = memoryRepoOrDeps;
    } else {
      this.memoryRepo = memoryRepoOrDeps;
      this.deps = optionalDeps ?? ({} as unknown as Omit<MemoryServiceDependencies, 'memoryRepo'>);
    }
  }

  /**
   * Creates a new, structured project memory item.
   */
  async createMemory(params: CreateMemoryInput): Promise<MemoryItem> {
    const title = validateNonEmptyString(params.title, 'Memory title');
    const content = validateNonEmptyString(params.content, 'Memory content');

    const type: MemoryType = params.type ?? 'key_context';
    if (!VALID_MEMORY_TYPES.has(type)) {
      throw new ValidationError(`Invalid memory type: ${String(type)}`);
    }

    const importance: MemoryImportance = params.importance ?? 'medium';
    if (!VALID_MEMORY_IMPORTANCES.has(importance)) {
      throw new ValidationError(`Invalid memory importance: ${String(importance)}`);
    }

    // Verify project exists in workspace
    if (this.deps.projectRepo) {
      const project = await this.deps.projectRepo.findById(params.projectId);
      if (!project || project.workspaceId !== params.workspaceId) {
        throw new NotFoundError('Project', params.projectId);
      }
    }

    // Validate source references if provided
    if (params.sourceReferences && params.sourceReferences.length > 0) {
      for (const ref of params.sourceReferences) {
        validateEntityType(ref.entityType, 'sourceReference.entityType');
        validateNonEmptyString(ref.entityId, 'sourceReference.entityId');
      }
    }

    const existingMemories = await this.memoryRepo.findByProjectId(params.projectId);
    const order = existingMemories.length + 1;
    const now = createCurrentTimestamp();

    const record: MemoryItem = {
      id: generateEntityId(),
      entityType: 'memory',
      workspaceId: params.workspaceId,
      projectId: params.projectId,
      title,
      content,
      type,
      importance,
      status: 'active',
      sourceReferences: params.sourceReferences ? [...params.sourceReferences] : undefined,
      tags: Object.freeze(params.tags ? [...params.tags] : []),
      reviewDate: params.reviewDate || undefined,
      order,
      createdAt: now,
      updatedAt: now,
    };

    const saved = await this.memoryRepo.save(record);
    this.log.info(
      `Project Memory created: "${saved.title}" (${saved.id}) [${saved.type}] in project ${saved.projectId}`,
    );
    return saved;
  }

  /**
   * Retrieves a memory item by ID, optionally validating expected project or workspace.
   */
  async getMemory(id: EntityId, expectedProjectId?: EntityId): Promise<MemoryItem | null> {
    const memory = await this.memoryRepo.findById(id);
    if (!memory) {
      return null;
    }
    if (
      expectedProjectId &&
      memory.projectId !== expectedProjectId &&
      memory.workspaceId !== expectedProjectId
    ) {
      return null;
    }
    return memory;
  }

  /**
   * Retrieves a memory item by ID or throws NotFoundError.
   */
  async getMemoryOrThrow(id: EntityId, expectedProjectId?: EntityId): Promise<MemoryItem> {
    const memory = await this.getMemory(id, expectedProjectId);
    if (!memory) {
      throw new NotFoundError('MemoryItem', id);
    }
    return memory;
  }

  /**
   * Updates an existing memory item.
   */
  async updateMemory(
    idOrParams: EntityId | (UpdateMemoryInput & { id: EntityId }),
    updatesOrExpectedProjectId?: UpdateMemoryInput | EntityId,
    expectedProjectId?: EntityId,
  ): Promise<MemoryItem> {
    let memoryId: EntityId;
    let updates: UpdateMemoryInput;
    let scopeProjectId: EntityId | undefined;

    if (typeof idOrParams === 'string') {
      memoryId = idOrParams;
      updates = (updatesOrExpectedProjectId as UpdateMemoryInput) || {};
      scopeProjectId = expectedProjectId;
    } else {
      memoryId = idOrParams.id;
      updates = idOrParams;
      scopeProjectId =
        typeof updatesOrExpectedProjectId === 'string'
          ? updatesOrExpectedProjectId
          : idOrParams.workspaceId;
    }

    const existing = await this.getMemoryOrThrow(memoryId, scopeProjectId);

    let title = existing.title;
    if (updates.title !== undefined) {
      title = validateNonEmptyString(updates.title, 'Memory title');
    }

    let content = existing.content;
    if (updates.content !== undefined) {
      content = validateNonEmptyString(updates.content, 'Memory content');
    }

    let type = existing.type;
    if (updates.type !== undefined) {
      if (!VALID_MEMORY_TYPES.has(updates.type)) {
        throw new ValidationError(`Invalid memory type: ${String(updates.type)}`);
      }
      type = updates.type;
    }

    let importance = existing.importance;
    if (updates.importance !== undefined) {
      if (!VALID_MEMORY_IMPORTANCES.has(updates.importance)) {
        throw new ValidationError(`Invalid memory importance: ${String(updates.importance)}`);
      }
      importance = updates.importance;
    }

    let status = existing.status;
    let archivedAt = existing.archivedAt;
    if (updates.status !== undefined) {
      if (updates.status !== 'active' && updates.status !== 'archived') {
        throw new ValidationError(`Invalid memory status: ${String(updates.status)}`);
      }
      status = updates.status;
      if (status === 'archived' && !archivedAt) {
        archivedAt = createCurrentTimestamp();
      } else if (status === 'active') {
        archivedAt = undefined;
      }
    }

    let sourceReferences = existing.sourceReferences;
    if (updates.sourceReferences !== undefined) {
      for (const ref of updates.sourceReferences) {
        validateEntityType(ref.entityType, 'sourceReference.entityType');
        validateNonEmptyString(ref.entityId, 'sourceReference.entityId');
      }
      sourceReferences = [...updates.sourceReferences];
    }

    let tags = existing.tags;
    if (updates.tags !== undefined) {
      tags = Object.freeze([...updates.tags]);
    }

    let reviewDate = existing.reviewDate;
    if (updates.reviewDate !== undefined) {
      reviewDate = updates.reviewDate ? updates.reviewDate : undefined;
    }

    const updated: MemoryItem = {
      ...existing,
      title,
      content,
      type,
      importance,
      status,
      sourceReferences,
      tags,
      reviewDate,
      archivedAt,
      updatedAt: createCurrentTimestamp(),
    };

    const saved = await this.memoryRepo.save(updated);
    this.log.info(`Project Memory updated: "${saved.title}" (${saved.id})`);
    return saved;
  }

  /**
   * Archives a memory item.
   */
  async archiveMemory(id: EntityId, expectedProjectId?: EntityId): Promise<MemoryItem> {
    return this.updateMemory(
      id,
      {
        status: 'archived',
      },
      expectedProjectId,
    );
  }

  /**
   * Restores an archived memory item back to active status.
   */
  async restoreMemory(id: EntityId, expectedProjectId?: EntityId): Promise<MemoryItem> {
    return this.updateMemory(
      id,
      {
        status: 'active',
      },
      expectedProjectId,
    );
  }

  /**
   * Permanently deletes a memory item.
   */
  async deleteMemory(id: EntityId, expectedProjectId?: EntityId): Promise<boolean> {
    const existing = await this.getMemoryOrThrow(id, expectedProjectId);
    const success = await this.memoryRepo.delete(id);
    if (success) {
      this.log.info(`Project Memory deleted: "${existing.title}" (${existing.id})`);
    }
    return success;
  }

  /**
   * Lists memory items for a project with optional filtering and sorting.
   */
  async listMemoriesByProject(
    projectId: EntityId,
    options: MemoryFilterOptions = {},
  ): Promise<readonly MemoryItem[]> {
    const allMemories = await this.memoryRepo.findByProjectId(projectId);
    return this.applyFiltersAndSort(allMemories, options);
  }

  /**
   * Lists active memory items for a project.
   */
  async listActiveMemories(
    projectId: EntityId,
    options: MemoryFilterOptions = {},
  ): Promise<readonly MemoryItem[]> {
    return this.listMemoriesByProject(projectId, { ...options, status: 'active' });
  }

  /**
   * Lists memory items for a workspace.
   */
  async listMemoriesByWorkspace(
    workspaceId: EntityId,
    options: MemoryFilterOptions = {},
  ): Promise<readonly MemoryItem[]> {
    const allMemories = await this.memoryRepo.findByWorkspaceId(workspaceId);
    return this.applyFiltersAndSort(allMemories, options);
  }

  /**
   * Helper to filter and sort memory items.
   */
  private applyFiltersAndSort(
    memories: readonly MemoryItem[],
    options: MemoryFilterOptions = {},
  ): readonly MemoryItem[] {
    let filtered = [...memories];

    if (options.status && options.status !== 'all') {
      filtered = filtered.filter((m) => m.status === options.status);
    }

    if (options.type && options.type !== 'all') {
      filtered = filtered.filter((m) => m.type === options.type);
    }

    if (options.importance && options.importance !== 'all') {
      filtered = filtered.filter((m) => m.importance === options.importance);
    }

    if (options.tag) {
      const tagLower = options.tag.toLowerCase();
      filtered = filtered.filter((m) => m.tags && m.tags.some((t) => t.toLowerCase() === tagLower));
    }

    if (options.tags && options.tags.length > 0) {
      const tagSet = new Set(options.tags.map((t) => t.toLowerCase()));
      filtered = filtered.filter((m) => m.tags && m.tags.some((t) => tagSet.has(t.toLowerCase())));
    }

    if (options.isDueForReview) {
      filtered = filtered.filter(
        (m) => m.status === 'active' && isMemoryDueForReview(m.reviewDate),
      );
    }

    if (options.searchQuery && options.searchQuery.trim().length > 0) {
      const q = options.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.content.toLowerCase().includes(q) ||
          (m.tags && m.tags.some((t) => t.toLowerCase().includes(q))),
      );
    }

    const sortBy = options.sortBy ?? 'updatedAt';
    const sortOrder = options.sortOrder ?? 'desc';
    const isAsc = sortOrder === 'asc';

    return filtered.sort((a, b) => {
      if (sortBy === 'importance') {
        const diff = isAsc
          ? IMPORTANCE_WEIGHTS[a.importance] - IMPORTANCE_WEIGHTS[b.importance]
          : IMPORTANCE_WEIGHTS[b.importance] - IMPORTANCE_WEIGHTS[a.importance];
        if (diff !== 0) return diff;
        return isAsc
          ? Date.parse(a.updatedAt) - Date.parse(b.updatedAt)
          : Date.parse(b.updatedAt) - Date.parse(a.updatedAt);
      }
      if (sortBy === 'title') {
        return isAsc ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
      }
      if (sortBy === 'createdAt') {
        return isAsc
          ? Date.parse(a.createdAt) - Date.parse(b.createdAt)
          : Date.parse(b.createdAt) - Date.parse(a.createdAt);
      }
      if (sortBy === 'reviewDate') {
        const aDate = a.reviewDate ? Date.parse(a.reviewDate) : Infinity;
        const bDate = b.reviewDate ? Date.parse(b.reviewDate) : Infinity;
        return isAsc ? aDate - bDate : bDate - aDate;
      }
      return isAsc
        ? Date.parse(a.updatedAt) - Date.parse(b.updatedAt)
        : Date.parse(b.updatedAt) - Date.parse(a.updatedAt);
    });
  }

  /**
   * Assembles a structured, deterministic memory context for an entire project.
   */
  async getProjectMemoryContext(projectId: EntityId): Promise<ProjectMemoryContext> {
    if (!this.deps.projectRepo) {
      throw new NotFoundError('Project', projectId);
    }
    const project = await this.deps.projectRepo.findById(projectId);
    if (!project) {
      throw new NotFoundError('Project', projectId);
    }

    const allMemories = await this.memoryRepo.findByProjectId(projectId);
    const activeMemories = allMemories.filter((m) => m.status === 'active');
    const archivedMemories = allMemories.filter((m) => m.status === 'archived');

    const dueForReview = activeMemories.filter((m) => isMemoryDueForReview(m.reviewDate));

    const criticalAndHigh = activeMemories
      .filter((m) => m.importance === 'critical' || m.importance === 'high')
      .sort((a, b) => IMPORTANCE_WEIGHTS[b.importance] - IMPORTANCE_WEIGHTS[a.importance]);

    const byType: Record<MemoryType, MemoryItem[]> = {
      fact: [],
      goal: [],
      constraint: [],
      preference: [],
      decision: [],
      key_context: [],
      note: [],
    };

    for (const mem of activeMemories) {
      if (byType[mem.type]) {
        byType[mem.type].push(mem);
      } else {
        byType.note.push(mem);
      }
    }

    const byImportance: Record<MemoryImportance, MemoryItem[]> = {
      critical: [],
      high: [],
      medium: [],
      low: [],
    };

    for (const mem of activeMemories) {
      if (byImportance[mem.importance]) {
        byImportance[mem.importance].push(mem);
      }
    }

    const byTypeCounts: Record<MemoryType, number> = {
      fact: byType.fact.length,
      goal: byType.goal.length,
      constraint: byType.constraint.length,
      preference: byType.preference.length,
      decision: byType.decision.length,
      key_context: byType.key_context.length,
      note: byType.note.length,
    };

    return {
      projectId,
      workspaceId: project.workspaceId,
      projectName: project.name,
      activeMemories,
      archivedMemories,
      byType,
      byImportance,
      criticalAndHigh,
      dueForReview,
      reviewDueItems: dueForReview,
      totalActiveCount: activeMemories.length,
      totalArchivedCount: archivedMemories.length,
      reviewDueCount: dueForReview.length,
      highImportanceCount: criticalAndHigh.length,
      counts: {
        total: allMemories.length,
        active: activeMemories.length,
        archived: archivedMemories.length,
        critical: byImportance.critical.length,
        dueForReview: dueForReview.length,
        byType: byTypeCounts,
      },
    };
  }

  /**
   * Resolves supporting source entities linked to a memory item.
   */
  async resolveSourceEntities(
    memoryOrReferences: MemoryItem | readonly MemorySourceReference[],
  ): Promise<readonly ResolvedMemorySource[]> {
    const references = Array.isArray(memoryOrReferences)
      ? memoryOrReferences
      : (memoryOrReferences as MemoryItem).sourceReferences;

    if (!references || references.length === 0) {
      return [];
    }

    const resolved: ResolvedMemorySource[] = [];

    for (const ref of references) {
      let title = ref.title;
      let exists = false;
      let route: string | undefined;

      try {
        switch (ref.entityType) {
          case 'chat': {
            if (this.deps.chatRepo) {
              const chat = await this.deps.chatRepo.findById(ref.entityId);
              if (chat) {
                exists = true;
                title = chat.title;
                route = `/projects/${chat.projectId}/chats/${chat.id}`;
              }
            }
            break;
          }
          case 'note': {
            if (this.deps.noteRepo) {
              const note = await this.deps.noteRepo.findById(ref.entityId);
              if (note) {
                exists = true;
                title = note.title;
                route = `/projects/${note.projectId}/notes/${note.id}`;
              }
            }
            break;
          }
          case 'file': {
            if (this.deps.fileRepo) {
              const file = await this.deps.fileRepo.findById(ref.entityId);
              if (file) {
                exists = true;
                title = file.originalFilename || file.name;
                route = file.projectId ? `/projects/${file.projectId}/files` : undefined;
              }
            }
            break;
          }
          case 'task': {
            if (this.deps.taskRepo) {
              const task = await this.deps.taskRepo.findById(ref.entityId);
              if (task) {
                exists = true;
                title = task.title;
                route = `/projects/${task.projectId}/tasks`;
              }
            }
            break;
          }
          case 'decision': {
            if (this.deps.decisionRepo) {
              const decision = await this.deps.decisionRepo.findById(ref.entityId);
              if (decision) {
                exists = true;
                title = decision.title;
                route = `/projects/${decision.projectId}/decisions`;
              }
            }
            break;
          }
          case 'link': {
            if (this.deps.linkRepo) {
              const link = await this.deps.linkRepo.findById(ref.entityId);
              if (link) {
                exists = true;
                title = link.title || link.url;
                route = link.projectId ? `/projects/${link.projectId}/resources` : undefined;
              }
            }
            break;
          }
          case 'bookmark': {
            if (this.deps.bookmarkRepo) {
              const bookmark = await this.deps.bookmarkRepo.findById(ref.entityId);
              if (bookmark) {
                exists = true;
                title = bookmark.title;
                route = bookmark.projectId
                  ? `/projects/${bookmark.projectId}/resources`
                  : undefined;
              }
            }
            break;
          }
          case 'code_snippet': {
            const repo = this.deps.snippetRepo || this.deps.codeSnippetRepo;
            if (repo) {
              const snippet = await repo.findById(ref.entityId);
              if (snippet) {
                exists = true;
                title = snippet.title || `${snippet.language} snippet`;
                route = snippet.projectId ? `/projects/${snippet.projectId}/resources` : undefined;
              }
            }
            break;
          }
          case 'reference': {
            if (this.deps.referenceRepo) {
              const reference = await this.deps.referenceRepo.findById(ref.entityId);
              if (reference) {
                exists = true;
                title = reference.title;
                route = reference.projectId
                  ? `/projects/${reference.projectId}/resources`
                  : undefined;
              }
            }
            break;
          }
          default:
            break;
        }
      } catch (err) {
        this.log.warn(`Failed to resolve source entity ${ref.entityType}:${ref.entityId}`, err);
      }

      resolved.push({
        entityType: ref.entityType,
        entityId: ref.entityId,
        title: title || ref.title || `${ref.entityType} reference`,
        excerpt: ref.excerpt,
        subtitle: ref.excerpt,
        exists,
        route,
        targetRoute: route,
        reference: ref,
      });
    }

    return resolved;
  }
}
