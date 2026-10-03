import { EntityType, RelationshipType, Relationship, Project, Tag } from '../entities';
import { EntityId } from '@/types';

/**
 * Origin categories explaining why two entities are considered connected.
 */
export type RelationshipOrigin = 'explicit' | 'project_membership' | 'shared_tags' | 'reference';

/**
 * Explainable provenance details for a discovered relational edge.
 */
export interface RelationshipExplanation {
  readonly origin: RelationshipOrigin;
  readonly description: string;
  readonly relationshipType?: RelationshipType;
  readonly sharedTagIds?: readonly EntityId[];
  readonly sharedTagNames?: readonly string[];
  readonly sourceField?: string;
  readonly depth: number;
}

/**
 * Universal lightweight reference descriptor for any entity in the Brain.
 */
export interface EntityReference {
  readonly entityType: EntityType;
  readonly entityId: EntityId;
  readonly title?: string;
  readonly projectId?: EntityId;
}

/**
 * Enriched representation of an entity connected within the Workspace Brain graph.
 */
export interface ConnectedEntity {
  readonly entityType: EntityType;
  readonly entityId: EntityId;
  readonly title: string;
  readonly subtitle?: string;
  readonly projectId?: EntityId;
  readonly projectName?: string;
  readonly tags?: readonly string[];
  readonly tagIds?: readonly EntityId[];
  readonly explanations: readonly RelationshipExplanation[];
  readonly createdAt?: string;
  readonly updatedAt?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

/**
 * Fully resolved explicit relationship edge connecting two entities.
 */
export interface ExplicitRelationshipDetail {
  readonly relationship: Relationship;
  readonly source: ConnectedEntity;
  readonly target: ConnectedEntity;
}

/**
 * Configurable traversal parameters for the deterministic RelationshipEngine.
 */
export interface TraversalOptions {
  readonly maxDepth?: number;
  readonly includeSameProject?: boolean;
  readonly includeSharedTags?: boolean;
  readonly includeExplicit?: boolean;
  readonly includeDerivedReferences?: boolean;
  readonly filterEntityTypes?: readonly EntityType[];
  readonly limit?: number;
}

/**
 * Read-only assembled context for a project workspace.
 */
export interface ProjectContextSummary {
  readonly project: Project;
  readonly counts: {
    readonly chats: number;
    readonly chatGroups: number;
    readonly files: number;
    readonly notes: number;
    readonly links: number;
    readonly bookmarks: number;
    readonly codeSnippets: number;
    readonly references: number;
    readonly tasks: number;
    readonly decisions: number;
    readonly explicitRelationships: number;
    readonly tags: number;
  };
  readonly tasksSummary: {
    readonly todo: number;
    readonly inProgress: number;
    readonly done: number;
    readonly cancelled: number;
    readonly overdue: number;
  };
  readonly decisionsSummary: {
    readonly proposed: number;
    readonly accepted: number;
    readonly superseded: number;
    readonly rejected: number;
  };
  readonly recentItems: readonly ConnectedEntity[];
  readonly explicitRelationships: readonly ExplicitRelationshipDetail[];
  readonly projectTags: readonly Tag[];
}

/**
 * Read-only assembled context for an individual entity.
 */
export interface EntityContextSummary {
  readonly target: ConnectedEntity;
  readonly project?: Project;
  readonly explicitOutgoing: readonly ExplicitRelationshipDetail[];
  readonly explicitIncoming: readonly ExplicitRelationshipDetail[];
  readonly relatedEntities: readonly ConnectedEntity[];
  readonly sharedTags: readonly Tag[];
}
