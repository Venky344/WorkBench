import { BaseService } from './base.service';
import { EntityType, RelationshipType, Relationship, Task, Tag } from '@/domain/entities';
import {
  ConnectedEntity,
  EntityContextSummary,
  ExplicitRelationshipDetail,
  ProjectContextSummary,
  TraversalOptions,
} from '@/domain/brain';
import { EntityId } from '@/types';
import {
  IProjectRepository,
  IChatRepository,
  IChatGroupRepository,
  IFileRepository,
  INoteRepository,
  ILinkRepository,
  IBookmarkRepository,
  IReferenceRepository,
  ICodeSnippetRepository,
  ITaskRepository,
  IDecisionRepository,
  ITagRepository,
  IRelationshipRepository,
} from '@/repositories/contracts/entity-repositories.contract';
import { RelationshipEngine } from './relationship.engine';
import { generateEntityId } from '@/domain/value-objects/id';
import { createCurrentTimestamp } from '@/domain/value-objects/timestamp';
import { validateEntityType } from '@/domain/validation/entity.validator';
import { ValidationError, NotFoundError } from '@/utils/errors';

export interface BrainServiceDependencies {
  readonly projectRepo: IProjectRepository;
  readonly chatRepo: IChatRepository;
  readonly chatGroupRepo: IChatGroupRepository;
  readonly fileRepo: IFileRepository;
  readonly noteRepo: INoteRepository;
  readonly linkRepo: ILinkRepository;
  readonly bookmarkRepo: IBookmarkRepository;
  readonly referenceRepo: IReferenceRepository;
  readonly codeSnippetRepo: ICodeSnippetRepository;
  readonly taskRepo: ITaskRepository;
  readonly decisionRepo: IDecisionRepository;
  readonly tagRepo: ITagRepository;
  readonly relationshipRepo: IRelationshipRepository;
}

export class BrainService extends BaseService {
  private readonly relationshipEngine: RelationshipEngine;

  constructor(private readonly deps: BrainServiceDependencies) {
    super('BrainService');
    this.relationshipEngine = new RelationshipEngine(deps);
  }

  /**
   * Deterministically finds all related entities for a given entity reference.
   */
  async findRelatedEntities(
    workspaceId: EntityId,
    entityType: EntityType,
    entityId: EntityId,
    options: TraversalOptions = {},
  ): Promise<readonly ConnectedEntity[]> {
    validateEntityType(entityType, 'entityType');
    return this.relationshipEngine.findRelatedEntities(
      workspaceId,
      { entityType, entityId },
      options,
    );
  }

  /**
   * Assembles rich, deterministic, read-only context for an entire project.
   */
  async getProjectContext(
    workspaceId: EntityId,
    projectId: EntityId,
  ): Promise<ProjectContextSummary> {
    const project = await this.deps.projectRepo.findById(projectId);
    if (!project || project.workspaceId !== workspaceId) {
      throw new NotFoundError('Project', projectId);
    }

    // Parallel fetch of all project assets
    const [
      chats,
      chatGroups,
      files,
      notes,
      links,
      bookmarks,
      codeSnippets,
      references,
      tasks,
      decisions,
      allWorkspaceTags,
      allRelationships,
    ] = await Promise.all([
      this.deps.chatRepo.findByProjectId(projectId),
      this.deps.chatGroupRepo.findByProjectId(projectId),
      this.deps.fileRepo.findByProjectId(projectId),
      this.deps.noteRepo.findByProjectId(projectId),
      this.deps.linkRepo.findByProjectId(projectId),
      this.deps.bookmarkRepo.findByProjectId(projectId),
      this.deps.codeSnippetRepo.findByProjectId(projectId),
      this.deps.referenceRepo.findByProjectId(projectId),
      this.deps.taskRepo.findByProjectId(projectId),
      this.deps.decisionRepo.findByProjectId(projectId),
      this.deps.tagRepo.findByWorkspaceId(workspaceId),
      this.deps.relationshipRepo.findByWorkspaceId(workspaceId),
    ]);

    // Tasks status summary
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isTaskOverdue = (t: Task) => {
      if (t.status === 'done' || t.status === 'cancelled' || !t.dueDate) return false;
      const due = new Date(t.dueDate);
      if (isNaN(due.getTime())) return false;
      return due.getTime() < today.getTime();
    };

    const tasksSummary = {
      todo: tasks.filter((t) => t.status === 'todo').length,
      inProgress: tasks.filter((t) => t.status === 'in_progress').length,
      done: tasks.filter((t) => t.status === 'done').length,
      cancelled: tasks.filter((t) => t.status === 'cancelled').length,
      overdue: tasks.filter(isTaskOverdue).length,
    };

    // Decisions summary
    const decisionsSummary = {
      proposed: decisions.filter((d) => d.status === 'proposed').length,
      accepted: decisions.filter((d) => d.status === 'accepted').length,
      superseded: decisions.filter((d) => d.status === 'superseded').length,
      rejected: decisions.filter((d) => d.status === 'rejected').length,
    };

    // Tags used in this project
    const usedTagIds = new Set<EntityId>();
    chats.forEach((c) => c.tags?.forEach((t) => usedTagIds.add(t)));
    files.forEach((f) => f.tags?.forEach((t) => usedTagIds.add(t)));
    notes.forEach((n) => n.tags?.forEach((t) => usedTagIds.add(t)));
    links.forEach((l) => l.tags?.forEach((t) => usedTagIds.add(t)));
    bookmarks.forEach((b) => b.tags?.forEach((t) => usedTagIds.add(t)));
    codeSnippets.forEach((s) => s.tags?.forEach((t) => usedTagIds.add(t)));
    references.forEach((r) => r.tags?.forEach((t) => usedTagIds.add(t)));
    tasks.forEach((t) => t.tags?.forEach((tag) => usedTagIds.add(tag)));
    decisions.forEach((d) => d.tags?.forEach((tag) => usedTagIds.add(tag)));

    const tagMap = new Map<EntityId, Tag>(allWorkspaceTags.map((t) => [t.id, t]));
    const projectTags: Tag[] = Array.from(usedTagIds)
      .map((id) => tagMap.get(id))
      .filter((t): t is Tag => !!t)
      .sort((a, b) => a.name.localeCompare(b.name));

    // Entity map for explicit relationship resolution
    const { entityMap } = await this.relationshipEngine.loadWorkspaceEntities(workspaceId);

    // Filter explicit relationships where either source or target belongs to this project (or is the project itself)
    const projectEntityIds = new Set<EntityId>([
      projectId,
      ...chats.map((c) => c.id),
      ...chatGroups.map((g) => g.id),
      ...files.map((f) => f.id),
      ...notes.map((n) => n.id),
      ...links.map((l) => l.id),
      ...bookmarks.map((b) => b.id),
      ...codeSnippets.map((s) => s.id),
      ...references.map((r) => r.id),
      ...tasks.map((t) => t.id),
      ...decisions.map((d) => d.id),
    ]);

    const explicitRelationships: ExplicitRelationshipDetail[] = [];
    for (const rel of allRelationships) {
      if (projectEntityIds.has(rel.sourceEntityId) || projectEntityIds.has(rel.targetEntityId)) {
        const sourceDesc = entityMap.get(`${rel.sourceEntityType}:${rel.sourceEntityId}`);
        const targetDesc = entityMap.get(`${rel.targetEntityType}:${rel.targetEntityId}`);

        if (sourceDesc && targetDesc) {
          explicitRelationships.push({
            relationship: rel,
            source: {
              entityType: sourceDesc.entityType,
              entityId: sourceDesc.entityId,
              title: sourceDesc.title,
              subtitle: sourceDesc.subtitle,
              projectId: sourceDesc.projectId,
              projectName: project.name,
              tags: sourceDesc.tagIds
                .map((t) => tagMap.get(t)?.name)
                .filter((n): n is string => !!n),
              tagIds: sourceDesc.tagIds,
              explanations: [
                {
                  origin: 'explicit',
                  description: `Source of explicit ${rel.relationshipType}`,
                  relationshipType: rel.relationshipType,
                  depth: 1,
                },
              ],
              createdAt: sourceDesc.createdAt,
              updatedAt: sourceDesc.updatedAt,
            },
            target: {
              entityType: targetDesc.entityType,
              entityId: targetDesc.entityId,
              title: targetDesc.title,
              subtitle: targetDesc.subtitle,
              projectId: targetDesc.projectId,
              projectName: project.name,
              tags: targetDesc.tagIds
                .map((t) => tagMap.get(t)?.name)
                .filter((n): n is string => !!n),
              tagIds: targetDesc.tagIds,
              explanations: [
                {
                  origin: 'explicit',
                  description: `Target of explicit ${rel.relationshipType}`,
                  relationshipType: rel.relationshipType,
                  depth: 1,
                },
              ],
              createdAt: targetDesc.createdAt,
              updatedAt: targetDesc.updatedAt,
            },
          });
        }
      }
    }

    // Recent items collection
    const recentItems: ConnectedEntity[] = [];
    const collectRecent = (
      type: EntityType,
      items: readonly {
        id: EntityId;
        title?: string;
        name?: string;
        createdAt: string;
        updatedAt: string;
        tags?: readonly EntityId[];
      }[],
    ) => {
      for (const item of items) {
        recentItems.push({
          entityType: type,
          entityId: item.id,
          title: item.title || item.name || 'Untitled',
          projectId,
          projectName: project.name,
          tags: item.tags?.map((t) => tagMap.get(t)?.name).filter((n): n is string => !!n),
          tagIds: item.tags,
          explanations: [
            {
              origin: 'project_membership',
              description: `Belongs to ${project.name}`,
              depth: 1,
            },
          ],
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        });
      }
    };

    collectRecent('chat', chats);
    collectRecent(
      'file',
      files.map((f) => ({ ...f, title: f.originalFilename || f.name })),
    );
    collectRecent('note', notes);
    collectRecent(
      'link',
      links.map((l) => ({ ...l, title: l.title || l.url })),
    );
    collectRecent(
      'bookmark',
      bookmarks.map((b) => ({ ...b, title: b.title || b.targetUrl || 'Bookmark' })),
    );
    collectRecent(
      'code_snippet',
      codeSnippets.map((s) => ({ ...s, title: s.title || `${s.language} snippet` })),
    );
    collectRecent('reference', references);
    collectRecent('task', tasks);
    collectRecent('decision', decisions);

    recentItems.sort((a, b) => {
      const timeA = a.updatedAt ? Date.parse(a.updatedAt) : 0;
      const timeB = b.updatedAt ? Date.parse(b.updatedAt) : 0;
      return timeB - timeA;
    });

    return {
      project,
      counts: {
        chats: chats.length,
        chatGroups: chatGroups.length,
        files: files.length,
        notes: notes.length,
        links: links.length,
        bookmarks: bookmarks.length,
        codeSnippets: codeSnippets.length,
        references: references.length,
        tasks: tasks.length,
        decisions: decisions.length,
        explicitRelationships: explicitRelationships.length,
        tags: projectTags.length,
      },
      tasksSummary,
      decisionsSummary,
      recentItems: recentItems.slice(0, 15),
      explicitRelationships,
      projectTags,
    };
  }

  /**
   * Assembles context for an individual entity with explicit & derived relationships.
   */
  async getEntityContext(
    workspaceId: EntityId,
    entityType: EntityType,
    entityId: EntityId,
  ): Promise<EntityContextSummary> {
    validateEntityType(entityType, 'entityType');

    const { entityMap, projectMap, tagMap } =
      await this.relationshipEngine.loadWorkspaceEntities(workspaceId);

    const targetDesc = entityMap.get(`${entityType}:${entityId}`);
    if (!targetDesc || targetDesc.workspaceId !== workspaceId) {
      throw new NotFoundError(entityType, entityId);
    }

    const project = targetDesc.projectId ? projectMap.get(targetDesc.projectId) : undefined;

    const targetTags = targetDesc.tagIds.map((t) => tagMap.get(t)).filter((t): t is Tag => !!t);

    const targetEntity: ConnectedEntity = {
      entityType: targetDesc.entityType,
      entityId: targetDesc.entityId,
      title: targetDesc.title,
      subtitle: targetDesc.subtitle,
      projectId: targetDesc.projectId,
      projectName: project?.name,
      tags: targetTags.map((t) => t.name),
      tagIds: targetDesc.tagIds,
      explanations: [],
      createdAt: targetDesc.createdAt,
      updatedAt: targetDesc.updatedAt,
      metadata: targetDesc.metadata,
    };

    // Load explicit outgoing and incoming
    const allRelationships = await this.deps.relationshipRepo.findByWorkspaceId(workspaceId);

    const explicitOutgoing: ExplicitRelationshipDetail[] = [];
    const explicitIncoming: ExplicitRelationshipDetail[] = [];

    for (const rel of allRelationships) {
      if (rel.sourceEntityType === entityType && rel.sourceEntityId === entityId) {
        const dest = entityMap.get(`${rel.targetEntityType}:${rel.targetEntityId}`);
        if (dest) {
          explicitOutgoing.push({
            relationship: rel,
            source: targetEntity,
            target: {
              entityType: dest.entityType,
              entityId: dest.entityId,
              title: dest.title,
              subtitle: dest.subtitle,
              projectId: dest.projectId,
              projectName: dest.projectId ? projectMap.get(dest.projectId)?.name : undefined,
              tags: dest.tagIds.map((t) => tagMap.get(t)?.name).filter((n): n is string => !!n),
              tagIds: dest.tagIds,
              explanations: [
                {
                  origin: 'explicit',
                  description: `Explicit link (${rel.relationshipType})`,
                  relationshipType: rel.relationshipType,
                  depth: 1,
                },
              ],
              createdAt: dest.createdAt,
              updatedAt: dest.updatedAt,
            },
          });
        }
      } else if (rel.targetEntityType === entityType && rel.targetEntityId === entityId) {
        const src = entityMap.get(`${rel.sourceEntityType}:${rel.sourceEntityId}`);
        if (src) {
          explicitIncoming.push({
            relationship: rel,
            source: {
              entityType: src.entityType,
              entityId: src.entityId,
              title: src.title,
              subtitle: src.subtitle,
              projectId: src.projectId,
              projectName: src.projectId ? projectMap.get(src.projectId)?.name : undefined,
              tags: src.tagIds.map((t) => tagMap.get(t)?.name).filter((n): n is string => !!n),
              tagIds: src.tagIds,
              explanations: [
                {
                  origin: 'explicit',
                  description: `Target of explicit link (${rel.relationshipType})`,
                  relationshipType: rel.relationshipType,
                  depth: 1,
                },
              ],
              createdAt: src.createdAt,
              updatedAt: src.updatedAt,
            },
            target: targetEntity,
          });
        }
      }
    }

    // Discover related entities via deterministic engine
    const relatedEntities = await this.relationshipEngine.findRelatedEntities(
      workspaceId,
      { entityType, entityId },
      { maxDepth: 1 },
    );

    return {
      target: targetEntity,
      project,
      explicitOutgoing,
      explicitIncoming,
      relatedEntities,
      sharedTags: targetTags,
    };
  }

  /**
   * Creates an explicit connection edge between two entities in the same workspace.
   */
  async linkEntities(params: {
    workspaceId: EntityId;
    sourceEntityType: EntityType;
    sourceEntityId: EntityId;
    relationshipType: RelationshipType;
    targetEntityType: EntityType;
    targetEntityId: EntityId;
    metadata?: Readonly<Record<string, string | number | boolean>>;
  }): Promise<Relationship> {
    validateEntityType(params.sourceEntityType, 'sourceEntityType');
    validateEntityType(params.targetEntityType, 'targetEntityType');

    if (
      params.sourceEntityType === params.targetEntityType &&
      params.sourceEntityId === params.targetEntityId
    ) {
      throw new ValidationError('Cannot link an entity to itself');
    }

    // Verify source and target existence and workspace boundary
    const { entityMap } = await this.relationshipEngine.loadWorkspaceEntities(params.workspaceId);
    const sourceDesc = entityMap.get(`${params.sourceEntityType}:${params.sourceEntityId}`);
    const targetDesc = entityMap.get(`${params.targetEntityType}:${params.targetEntityId}`);

    if (!sourceDesc || sourceDesc.workspaceId !== params.workspaceId) {
      throw new NotFoundError(params.sourceEntityType, params.sourceEntityId);
    }
    if (!targetDesc || targetDesc.workspaceId !== params.workspaceId) {
      throw new NotFoundError(params.targetEntityType, params.targetEntityId);
    }

    // Check if duplicate explicit relationship exists
    const existing = await this.deps.relationshipRepo.findRelationships(
      params.sourceEntityId,
      params.relationshipType,
      params.targetEntityId,
    );

    if (existing.length > 0 && existing[0]) {
      return existing[0];
    }

    const now = createCurrentTimestamp();
    const relationship: Relationship = {
      id: generateEntityId(),
      workspaceId: params.workspaceId,
      sourceEntityType: params.sourceEntityType,
      sourceEntityId: params.sourceEntityId,
      relationshipType: params.relationshipType,
      targetEntityType: params.targetEntityType,
      targetEntityId: params.targetEntityId,
      metadata: params.metadata,
      createdAt: now,
      updatedAt: now,
    };

    const saved = await this.deps.relationshipRepo.save(relationship);
    this.log.info(
      `Explicit relationship linked: ${params.sourceEntityType}:${params.sourceEntityId} -[${params.relationshipType}]-> ${params.targetEntityType}:${params.targetEntityId}`,
    );
    return saved;
  }

  /**
   * Unlinks an explicit relationship by its relationship ID.
   */
  async unlinkRelationship(workspaceId: EntityId, relationshipId: EntityId): Promise<boolean> {
    const rel = await this.deps.relationshipRepo.findById(relationshipId);
    if (!rel || rel.workspaceId !== workspaceId) {
      return false;
    }
    const deleted = await this.deps.relationshipRepo.delete(relationshipId);
    if (deleted) {
      this.log.info(`Relationship unlinked: ${relationshipId}`);
    }
    return deleted;
  }

  /**
   * Unlinks entities by source, type, and target endpoints.
   */
  async unlinkEntities(
    workspaceId: EntityId,
    sourceEntityId: EntityId,
    relationshipType: RelationshipType,
    targetEntityId: EntityId,
  ): Promise<number> {
    const relationships = await this.deps.relationshipRepo.findRelationships(
      sourceEntityId,
      relationshipType,
      targetEntityId,
    );
    const inWorkspace = relationships.filter((r) => r.workspaceId === workspaceId);
    if (inWorkspace.length === 0) return 0;

    const ids = inWorkspace.map((r) => r.id);
    const count = await this.deps.relationshipRepo.deleteBatch(ids);
    this.log.info(
      `Unlinked ${count} relationships between ${sourceEntityId} and ${targetEntityId}`,
    );
    return count;
  }

  /**
   * Lists all explicit relationships within a workspace, optionally filtered by project.
   */
  async listExplicitRelationships(
    workspaceId: EntityId,
    projectId?: EntityId,
  ): Promise<readonly ExplicitRelationshipDetail[]> {
    const all = await this.deps.relationshipRepo.findByWorkspaceId(workspaceId);
    const { entityMap, projectMap, tagMap } =
      await this.relationshipEngine.loadWorkspaceEntities(workspaceId);

    const results: ExplicitRelationshipDetail[] = [];

    for (const rel of all) {
      const sourceDesc = entityMap.get(`${rel.sourceEntityType}:${rel.sourceEntityId}`);
      const targetDesc = entityMap.get(`${rel.targetEntityType}:${rel.targetEntityId}`);

      if (sourceDesc && targetDesc) {
        if (
          projectId &&
          sourceDesc.projectId !== projectId &&
          targetDesc.projectId !== projectId &&
          sourceDesc.entityId !== projectId &&
          targetDesc.entityId !== projectId
        ) {
          continue;
        }

        results.push({
          relationship: rel,
          source: {
            entityType: sourceDesc.entityType,
            entityId: sourceDesc.entityId,
            title: sourceDesc.title,
            subtitle: sourceDesc.subtitle,
            projectId: sourceDesc.projectId,
            projectName: sourceDesc.projectId
              ? projectMap.get(sourceDesc.projectId)?.name
              : undefined,
            tags: sourceDesc.tagIds.map((t) => tagMap.get(t)?.name).filter((n): n is string => !!n),
            tagIds: sourceDesc.tagIds,
            explanations: [],
            createdAt: sourceDesc.createdAt,
            updatedAt: sourceDesc.updatedAt,
          },
          target: {
            entityType: targetDesc.entityType,
            entityId: targetDesc.entityId,
            title: targetDesc.title,
            subtitle: targetDesc.subtitle,
            projectId: targetDesc.projectId,
            projectName: targetDesc.projectId
              ? projectMap.get(targetDesc.projectId)?.name
              : undefined,
            tags: targetDesc.tagIds.map((t) => tagMap.get(t)?.name).filter((n): n is string => !!n),
            tagIds: targetDesc.tagIds,
            explanations: [],
            createdAt: targetDesc.createdAt,
            updatedAt: targetDesc.updatedAt,
          },
        });
      }
    }

    return results;
  }

  /**
   * Cascading cleanup for when an entity is deleted from the workspace.
   */
  async deleteEntityRelationships(
    workspaceId: EntityId,
    entityType: EntityType,
    entityId: EntityId,
  ): Promise<number> {
    const all = await this.deps.relationshipRepo.findByEntity(entityType, entityId);
    const inWorkspace = all.filter((r) => r.workspaceId === workspaceId);
    if (inWorkspace.length === 0) return 0;
    return this.deps.relationshipRepo.deleteBatch(inWorkspace.map((r) => r.id));
  }
}
