import { EntityType, Relationship, Project, Tag } from '@/domain/entities';
import {
  ConnectedEntity,
  EntityReference,
  RelationshipExplanation,
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

export interface RelationshipEngineDependencies {
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

interface RawEntityDescriptor {
  readonly entityType: EntityType;
  readonly entityId: EntityId;
  readonly workspaceId: EntityId;
  readonly title: string;
  readonly subtitle?: string;
  readonly projectId?: EntityId;
  readonly tagIds: readonly EntityId[];
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export class RelationshipEngine {
  constructor(private readonly deps: RelationshipEngineDependencies) {}

  /**
   * Deterministically finds all related entities for a given target entity reference.
   */
  async findRelatedEntities(
    workspaceId: EntityId,
    source: EntityReference,
    options: TraversalOptions = {},
  ): Promise<readonly ConnectedEntity[]> {
    const maxDepth = Math.min(Math.max(options.maxDepth ?? 1, 1), 2);
    const includeSameProject = options.includeSameProject ?? true;
    const includeSharedTags = options.includeSharedTags ?? true;
    const includeExplicit = options.includeExplicit ?? true;
    const includeDerivedReferences = options.includeDerivedReferences ?? true;

    // Load workspace snapshot and entity index
    const { entityMap, projectMap, tagMap } = await this.loadWorkspaceEntities(workspaceId);

    const rootKey = `${source.entityType}:${source.entityId}`;
    const rootEntity = entityMap.get(rootKey);

    if (!rootEntity) {
      return [];
    }

    // Load explicit relationships for the workspace
    const explicitRelationships = includeExplicit
      ? await this.deps.relationshipRepo.findByWorkspaceId(workspaceId)
      : [];

    // Discovered map: key -> { entity: RawEntityDescriptor, explanations: RelationshipExplanation[], minDepth: number }
    const discovered = new Map<
      string,
      {
        entity: RawEntityDescriptor;
        explanations: RelationshipExplanation[];
        minDepth: number;
      }
    >();

    // Helper to record an edge
    const addExplanation = (target: RawEntityDescriptor, explanation: RelationshipExplanation) => {
      const key = `${target.entityType}:${target.entityId}`;
      if (key === rootKey) return; // exclude root entity

      const existing = discovered.get(key);
      if (existing) {
        // avoid duplicate identical descriptions
        const duplicate = existing.explanations.some(
          (e) => e.origin === explanation.origin && e.description === explanation.description,
        );
        if (!duplicate) {
          existing.explanations.push(explanation);
        }
        if (explanation.depth < existing.minDepth) {
          existing.minDepth = explanation.depth;
        }
      } else {
        discovered.set(key, {
          entity: target,
          explanations: [explanation],
          minDepth: explanation.depth,
        });
      }
    };

    // --- STEP 1: Direct Discovery (Depth 1) ---
    this.discoverDirectConnections(
      rootEntity,
      entityMap,
      projectMap,
      tagMap,
      explicitRelationships,
      1,
      {
        includeSameProject,
        includeSharedTags,
        includeExplicit,
        includeDerivedReferences,
      },
      addExplanation,
    );

    // --- STEP 2: 2nd Degree Discovery (Depth 2) if requested ---
    if (maxDepth >= 2) {
      const depth1Entries = Array.from(discovered.values()).filter((d) => d.minDepth === 1);
      for (const entry of depth1Entries) {
        this.discoverDirectConnections(
          entry.entity,
          entityMap,
          projectMap,
          tagMap,
          explicitRelationships,
          2,
          {
            // For depth 2, prefer explicit and derived connections rather than loose same-project flooding
            includeSameProject: false,
            includeSharedTags: includeSharedTags,
            includeExplicit: includeExplicit,
            includeDerivedReferences: includeDerivedReferences,
          },
          addExplanation,
        );
      }
    }

    // --- Format & Filter Results ---
    let results: ConnectedEntity[] = Array.from(discovered.values()).map((d) => {
      const projectName = d.entity.projectId ? projectMap.get(d.entity.projectId)?.name : undefined;

      const tagNames = d.entity.tagIds
        .map((tid) => tagMap.get(tid)?.name)
        .filter((name): name is string => !!name);

      return {
        entityType: d.entity.entityType,
        entityId: d.entity.entityId,
        title: d.entity.title,
        subtitle: d.entity.subtitle,
        projectId: d.entity.projectId,
        projectName,
        tags: tagNames,
        tagIds: d.entity.tagIds,
        explanations: d.explanations,
        createdAt: d.entity.createdAt,
        updatedAt: d.entity.updatedAt,
        metadata: d.entity.metadata,
      };
    });

    if (options.filterEntityTypes && options.filterEntityTypes.length > 0) {
      const allowed = new Set(options.filterEntityTypes);
      results = results.filter((r) => allowed.has(r.entityType));
    }

    // Deterministic sort:
    // 1. Min depth ascending (depth 1 before depth 2)
    // 2. Explanation count descending (more strongly connected first)
    // 3. Title alphabetical
    // 4. EntityId alphabetical
    results.sort((a, b) => {
      const minDepthA = Math.min(...a.explanations.map((e) => e.depth));
      const minDepthB = Math.min(...b.explanations.map((e) => e.depth));
      if (minDepthA !== minDepthB) return minDepthA - minDepthB;

      if (b.explanations.length !== a.explanations.length) {
        return b.explanations.length - a.explanations.length;
      }
      const titleDiff = a.title.localeCompare(b.title);
      if (titleDiff !== 0) return titleDiff;
      return a.entityId.localeCompare(b.entityId);
    });

    if (options.limit && options.limit > 0) {
      results = results.slice(0, options.limit);
    }

    return results;
  }

  /**
   * Helper to discover 1-hop connections from a given entity.
   */
  private discoverDirectConnections(
    source: RawEntityDescriptor,
    entityMap: Map<string, RawEntityDescriptor>,
    projectMap: Map<EntityId, Project>,
    tagMap: Map<EntityId, Tag>,
    explicitRelationships: readonly Relationship[],
    depth: number,
    flags: {
      includeSameProject: boolean;
      includeSharedTags: boolean;
      includeExplicit: boolean;
      includeDerivedReferences: boolean;
    },
    emit: (target: RawEntityDescriptor, explanation: RelationshipExplanation) => void,
  ): void {
    const sourceKey = `${source.entityType}:${source.entityId}`;

    // 1. Explicit relationships
    if (flags.includeExplicit) {
      for (const rel of explicitRelationships) {
        if (rel.sourceEntityType === source.entityType && rel.sourceEntityId === source.entityId) {
          const targetKey = `${rel.targetEntityType}:${rel.targetEntityId}`;
          const target = entityMap.get(targetKey);
          if (target) {
            emit(target, {
              origin: 'explicit',
              description: `Explicit link (${rel.relationshipType})`,
              relationshipType: rel.relationshipType,
              depth,
            });
          }
        } else if (
          rel.targetEntityType === source.entityType &&
          rel.targetEntityId === source.entityId
        ) {
          const targetKey = `${rel.sourceEntityType}:${rel.sourceEntityId}`;
          const target = entityMap.get(targetKey);
          if (target) {
            emit(target, {
              origin: 'explicit',
              description: `Target of explicit link (${rel.relationshipType})`,
              relationshipType: rel.relationshipType,
              depth,
            });
          }
        }
      }
    }

    // 2. Shared tags
    if (flags.includeSharedTags && source.tagIds.length > 0) {
      const sourceTagSet = new Set(source.tagIds);

      for (const [key, target] of entityMap.entries()) {
        if (key === sourceKey) continue;
        const sharedTagIds = target.tagIds.filter((t) => sourceTagSet.has(t));
        if (sharedTagIds.length > 0) {
          const sharedNames = sharedTagIds
            .map((t) => tagMap.get(t)?.name)
            .filter((n): n is string => !!n);

          const desc =
            sharedNames.length === 1
              ? `Shares tag #${sharedNames[0]}`
              : `Shares ${sharedNames.length} tags (${sharedNames.map((n) => `#${n}`).join(', ')})`;

          emit(target, {
            origin: 'shared_tags',
            description: desc,
            sharedTagIds,
            sharedTagNames: sharedNames,
            depth,
          });
        }
      }
    }

    // 3. Project Membership
    if (flags.includeSameProject && source.projectId) {
      const projName = projectMap.get(source.projectId)?.name ?? 'current project';
      for (const [key, target] of entityMap.entries()) {
        if (key === sourceKey) continue;
        if (target.projectId === source.projectId) {
          emit(target, {
            origin: 'project_membership',
            description: `Belongs to same project (${projName})`,
            depth,
          });
        }
      }
    }

    // 4. Derived Domain References
    if (flags.includeDerivedReferences) {
      this.discoverDerivedReferences(source, entityMap, depth, emit);
    }
  }

  /**
   * Discovers domain-specific references like Task -> Decision, Bookmark -> Target, Reference -> Source, CodeSnippet -> Chat, etc.
   */
  private discoverDerivedReferences(
    source: RawEntityDescriptor,
    entityMap: Map<string, RawEntityDescriptor>,
    depth: number,
    emit: (target: RawEntityDescriptor, explanation: RelationshipExplanation) => void,
  ): void {
    const meta = source.metadata ?? {};

    // Task linked to Decision
    if (source.entityType === 'task' && meta.decisionId) {
      const decTarget = entityMap.get(`decision:${meta.decisionId as string}`);
      if (decTarget) {
        emit(decTarget, {
          origin: 'reference',
          description: 'Linked Decision for this task',
          sourceField: 'decisionId',
          depth,
        });
      }
    }

    // Decision linked to Tasks (inverse check across entity map)
    if (source.entityType === 'decision') {
      for (const target of entityMap.values()) {
        if (target.entityType === 'task' && target.metadata?.decisionId === source.entityId) {
          emit(target, {
            origin: 'reference',
            description: 'Task implementing this decision',
            sourceField: 'decisionId',
            depth,
          });
        }
      }
    }

    // Bookmark pointing to target entity
    if (source.entityType === 'bookmark' && meta.targetEntityType && meta.targetEntityId) {
      const target = entityMap.get(
        `${meta.targetEntityType as string}:${meta.targetEntityId as string}`,
      );
      if (target) {
        emit(target, {
          origin: 'reference',
          description: 'Bookmarked target entity',
          sourceField: 'targetEntityId',
          depth,
        });
      }
    }

    // Inverse check for bookmark pointing to this source entity
    for (const target of entityMap.values()) {
      if (
        target.entityType === 'bookmark' &&
        target.metadata?.targetEntityType === source.entityType &&
        target.metadata?.targetEntityId === source.entityId
      ) {
        emit(target, {
          origin: 'reference',
          description: 'Bookmarked by this item',
          sourceField: 'targetEntityId',
          depth,
        });
      }
    }

    // Reference pointing to source entity
    if (source.entityType === 'reference' && meta.sourceEntityType && meta.sourceEntityId) {
      const target = entityMap.get(
        `${meta.sourceEntityType as string}:${meta.sourceEntityId as string}`,
      );
      if (target) {
        emit(target, {
          origin: 'reference',
          description: 'Referenced source entity',
          sourceField: 'sourceEntityId',
          depth,
        });
      }
    }

    // Inverse check for reference pointing to this source entity
    for (const target of entityMap.values()) {
      if (
        target.entityType === 'reference' &&
        target.metadata?.sourceEntityType === source.entityType &&
        target.metadata?.sourceEntityId === source.entityId
      ) {
        emit(target, {
          origin: 'reference',
          description: 'Referenced by this reference item',
          sourceField: 'sourceEntityId',
          depth,
        });
      }
    }

    // CodeSnippet linked to Chat
    if (source.entityType === 'code_snippet' && meta.chatId) {
      const target = entityMap.get(`chat:${meta.chatId as string}`);
      if (target) {
        emit(target, {
          origin: 'reference',
          description: 'Chat where snippet was created',
          sourceField: 'chatId',
          depth,
        });
      }
    }

    // Chat containing Code Snippets (inverse)
    if (source.entityType === 'chat') {
      for (const target of entityMap.values()) {
        if (target.entityType === 'code_snippet' && target.metadata?.chatId === source.entityId) {
          emit(target, {
            origin: 'reference',
            description: 'Code snippet extracted from this chat',
            sourceField: 'chatId',
            depth,
          });
        }
      }
    }

    // Chat in ChatGroup
    if (source.entityType === 'chat' && meta.chatGroupId) {
      const target = entityMap.get(`chat_group:${meta.chatGroupId as string}`);
      if (target) {
        emit(target, {
          origin: 'reference',
          description: 'Chat Group container',
          sourceField: 'chatGroupId',
          depth,
        });
      }
    }

    // ChatGroup containing Chats
    if (source.entityType === 'chat_group') {
      for (const target of entityMap.values()) {
        if (target.entityType === 'chat' && target.metadata?.chatGroupId === source.entityId) {
          emit(target, {
            origin: 'reference',
            description: 'Chat in this group',
            sourceField: 'chatGroupId',
            depth,
          });
        }
      }
    }
  }

  /**
   * Loads and indexes all workspace entities for fast, deterministic graph traversal.
   */
  async loadWorkspaceEntities(workspaceId: EntityId): Promise<{
    entityMap: Map<string, RawEntityDescriptor>;
    projectMap: Map<EntityId, Project>;
    tagMap: Map<EntityId, Tag>;
  }> {
    const entityMap = new Map<string, RawEntityDescriptor>();
    const projectMap = new Map<EntityId, Project>();
    const tagMap = new Map<EntityId, Tag>();

    // Projects
    const projects = await this.deps.projectRepo.findByWorkspaceId(workspaceId);
    for (const p of projects) {
      projectMap.set(p.id, p);
      entityMap.set(`project:${p.id}`, {
        entityType: 'project',
        entityId: p.id,
        workspaceId: p.workspaceId,
        title: p.name,
        subtitle: p.description ?? undefined,
        projectId: p.id,
        tagIds: [],
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      });
    }

    // Tags
    const tags = await this.deps.tagRepo.findByWorkspaceId(workspaceId);
    for (const t of tags) {
      tagMap.set(t.id, t);
      entityMap.set(`tag:${t.id}`, {
        entityType: 'tag',
        entityId: t.id,
        workspaceId: t.workspaceId,
        title: `#${t.name}`,
        subtitle: t.description ?? undefined,
        tagIds: [],
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      });
    }

    // Chats
    const chats = await this.deps.chatRepo.findByWorkspaceId(workspaceId);
    for (const c of chats) {
      entityMap.set(`chat:${c.id}`, {
        entityType: 'chat',
        entityId: c.id,
        workspaceId: c.workspaceId,
        title: c.title,
        projectId: c.projectId,
        tagIds: c.tags ?? [],
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        metadata: {
          chatGroupId: c.chatGroupId,
          sourceId: c.sourceId,
        },
      });
    }

    // Chat Groups
    for (const p of projects) {
      const groups = await this.deps.chatGroupRepo.findByProjectId(p.id);
      for (const g of groups) {
        entityMap.set(`chat_group:${g.id}`, {
          entityType: 'chat_group',
          entityId: g.id,
          workspaceId: g.workspaceId,
          title: g.name,
          projectId: g.projectId,
          tagIds: [],
          createdAt: g.createdAt,
          updatedAt: g.updatedAt,
        });
      }
    }

    // Files
    const files = await this.deps.fileRepo.findByWorkspaceId(workspaceId);
    for (const f of files) {
      entityMap.set(`file:${f.id}`, {
        entityType: 'file',
        entityId: f.id,
        workspaceId: f.workspaceId,
        title: f.originalFilename || f.name,
        subtitle: f.mimeType,
        projectId: f.projectId,
        tagIds: f.tags ?? [],
        createdAt: f.createdAt,
        updatedAt: f.updatedAt,
        metadata: {
          sourceId: f.sourceId,
          size: f.sizeBytes,
        },
      });
    }

    // Notes
    const notes = await this.deps.noteRepo.findByWorkspaceId(workspaceId);
    for (const n of notes) {
      entityMap.set(`note:${n.id}`, {
        entityType: 'note',
        entityId: n.id,
        workspaceId: n.workspaceId,
        title: n.title,
        projectId: n.projectId,
        tagIds: n.tags ?? [],
        createdAt: n.createdAt,
        updatedAt: n.updatedAt,
      });
    }

    // Links
    const links = await this.deps.linkRepo.findByWorkspaceId(workspaceId);
    for (const l of links) {
      entityMap.set(`link:${l.id}`, {
        entityType: 'link',
        entityId: l.id,
        workspaceId: l.workspaceId,
        title: l.title || l.url,
        subtitle: l.domain,
        projectId: l.projectId,
        tagIds: l.tags ?? [],
        createdAt: l.createdAt,
        updatedAt: l.updatedAt,
        metadata: { url: l.url, domain: l.domain },
      });
    }

    // Bookmarks
    const bookmarks = await this.deps.bookmarkRepo.findByWorkspaceId(workspaceId);
    for (const b of bookmarks) {
      entityMap.set(`bookmark:${b.id}`, {
        entityType: 'bookmark',
        entityId: b.id,
        workspaceId: b.workspaceId,
        title: b.title || b.targetUrl || 'Bookmark',
        subtitle: b.targetUrl,
        projectId: b.projectId,
        tagIds: b.tags ?? [],
        createdAt: b.createdAt,
        updatedAt: b.updatedAt,
        metadata: {
          targetUrl: b.targetUrl,
          targetEntityType: b.targetEntityType,
          targetEntityId: b.targetEntityId,
        },
      });
    }

    // References
    const references = await this.deps.referenceRepo.findByWorkspaceId(workspaceId);
    for (const r of references) {
      entityMap.set(`reference:${r.id}`, {
        entityType: 'reference',
        entityId: r.id,
        workspaceId: r.workspaceId,
        title: r.title,
        subtitle: r.referenceKind,
        projectId: r.projectId,
        tagIds: r.tags ?? [],
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        metadata: {
          sourceEntityType: r.sourceEntityType,
          sourceEntityId: r.sourceEntityId,
          referenceKind: r.referenceKind,
        },
      });
    }

    // Code Snippets
    const snippets = await this.deps.codeSnippetRepo.findByWorkspaceId(workspaceId);
    for (const s of snippets) {
      entityMap.set(`code_snippet:${s.id}`, {
        entityType: 'code_snippet',
        entityId: s.id,
        workspaceId: s.workspaceId,
        title: s.title || `${s.language} snippet`,
        subtitle: s.language,
        projectId: s.projectId,
        tagIds: s.tags ?? [],
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
        metadata: { language: s.language, chatId: s.chatId },
      });
    }

    // Tasks
    const tasks = await this.deps.taskRepo.findByWorkspaceId(workspaceId);
    for (const t of tasks) {
      entityMap.set(`task:${t.id}`, {
        entityType: 'task',
        entityId: t.id,
        workspaceId: t.workspaceId,
        title: t.title,
        subtitle: `Priority: ${t.priority} • Status: ${t.status}`,
        projectId: t.projectId,
        tagIds: t.tags ?? [],
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        metadata: {
          status: t.status,
          priority: t.priority,
          decisionId: t.decisionId,
        },
      });
    }

    // Decisions
    const decisions = await this.deps.decisionRepo.findByWorkspaceId(workspaceId);
    for (const d of decisions) {
      entityMap.set(`decision:${d.id}`, {
        entityType: 'decision',
        entityId: d.id,
        workspaceId: d.workspaceId,
        title: d.title,
        subtitle: `Status: ${d.status}`,
        projectId: d.projectId,
        tagIds: d.tags ?? [],
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
        metadata: {
          status: d.status,
        },
      });
    }

    return { entityMap, projectMap, tagMap };
  }
}
