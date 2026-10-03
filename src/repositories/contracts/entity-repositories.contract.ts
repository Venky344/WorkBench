import { IRepository } from './repository.interface';
import {
  Workspace,
  User,
  Project,
  Chat,
  Message,
  ChatGroup,
  FileEntity,
  Note,
  Link,
  Bookmark,
  Reference,
  CodeSnippet,
  Task,
  Decision,
  Tag,
  Source,
  Relationship,
  ActivityEvent,
  InboxItem,
  Automation,
  ProjectTemplate,
  EntityType,
  RelationshipType,
  TaskStatus,
  DecisionStatus,
  MessageRole,
  InboxStatus,
} from '@/domain/entities';
import { EntityId } from '@/types';
import { SourceProvider } from '@/domain/value-objects/provenance';

export interface IWorkspaceRepository extends IRepository<Workspace> {
  findDefault(): Promise<Workspace | null>;
}

export interface IUserRepository extends IRepository<User> {
  findByWorkspaceId(workspaceId: EntityId): Promise<readonly User[]>;
}

export interface IProjectRepository extends IRepository<Project> {
  findBySlug(slug: string): Promise<Project | null>;
  findByWorkspaceId(workspaceId: EntityId): Promise<readonly Project[]>;
  findActive(workspaceId: EntityId): Promise<readonly Project[]>;
  findArchived(workspaceId: EntityId): Promise<readonly Project[]>;
  findPinned(workspaceId: EntityId): Promise<readonly Project[]>;
  existsByName(workspaceId: EntityId, name: string, excludeId?: EntityId): Promise<boolean>;
}

export interface IChatRepository extends IRepository<Chat> {
  findByProjectId(projectId: EntityId): Promise<readonly Chat[]>;
  findByChatGroupId(chatGroupId: EntityId): Promise<readonly Chat[]>;
  findBySourceId(sourceId: EntityId): Promise<readonly Chat[]>;
  findByWorkspaceId(workspaceId: EntityId): Promise<readonly Chat[]>;
  findActive(projectId: EntityId): Promise<readonly Chat[]>;
  findPinned(projectId: EntityId): Promise<readonly Chat[]>;
  findFavorites(projectId: EntityId): Promise<readonly Chat[]>;
  findArchived(projectId: EntityId): Promise<readonly Chat[]>;
  findUngrouped(projectId: EntityId): Promise<readonly Chat[]>;
}

export interface IMessageRepository extends IRepository<Message> {
  findByChatId(chatId: EntityId): Promise<readonly Message[]>;
  findByRole(chatId: EntityId, role: MessageRole): Promise<readonly Message[]>;
  deleteByChatId(chatId: EntityId): Promise<number>;
}

export interface IChatGroupRepository extends IRepository<ChatGroup> {
  findByProjectId(projectId: EntityId): Promise<readonly ChatGroup[]>;
  findPinned(projectId: EntityId): Promise<readonly ChatGroup[]>;
  existsByName(projectId: EntityId, name: string, excludeId?: EntityId): Promise<boolean>;
}

export interface IFileRepository extends IRepository<FileEntity> {
  findByProjectId(projectId: EntityId): Promise<readonly FileEntity[]>;
  findByWorkspaceId(workspaceId: EntityId): Promise<readonly FileEntity[]>;
  findBySourceId(sourceId: EntityId): Promise<readonly FileEntity[]>;
}

export interface INoteRepository extends IRepository<Note> {
  findByProjectId(projectId: EntityId): Promise<readonly Note[]>;
  findByWorkspaceId(workspaceId: EntityId): Promise<readonly Note[]>;
  findPinned(projectId: EntityId): Promise<readonly Note[]>;
}

export interface ILinkRepository extends IRepository<Link> {
  findByProjectId(projectId: EntityId): Promise<readonly Link[]>;
  findByWorkspaceId(workspaceId: EntityId): Promise<readonly Link[]>;
  findByDomain(domain: string): Promise<readonly Link[]>;
}

export interface IBookmarkRepository extends IRepository<Bookmark> {
  findByProjectId(projectId: EntityId): Promise<readonly Bookmark[]>;
  findByWorkspaceId(workspaceId: EntityId): Promise<readonly Bookmark[]>;
  findByTarget(
    targetEntityType: EntityType,
    targetEntityId: EntityId,
  ): Promise<readonly Bookmark[]>;
}

export interface IReferenceRepository extends IRepository<Reference> {
  findByProjectId(projectId: EntityId): Promise<readonly Reference[]>;
  findByWorkspaceId(workspaceId: EntityId): Promise<readonly Reference[]>;
  findBySourceEntity(
    sourceEntityType: EntityType,
    sourceEntityId: EntityId,
  ): Promise<readonly Reference[]>;
}

export interface ICodeSnippetRepository extends IRepository<CodeSnippet> {
  findByProjectId(projectId: EntityId): Promise<readonly CodeSnippet[]>;
  findByWorkspaceId(workspaceId: EntityId): Promise<readonly CodeSnippet[]>;
  findByLanguage(language: string): Promise<readonly CodeSnippet[]>;
  findByChatId(chatId: EntityId): Promise<readonly CodeSnippet[]>;
}

export interface ITaskRepository extends IRepository<Task> {
  findByProjectId(projectId: EntityId): Promise<readonly Task[]>;
  findByStatus(projectId: EntityId, status: TaskStatus): Promise<readonly Task[]>;
  findByDecisionId(decisionId: EntityId): Promise<readonly Task[]>;
}

export interface IDecisionRepository extends IRepository<Decision> {
  findByProjectId(projectId: EntityId): Promise<readonly Decision[]>;
  findByStatus(projectId: EntityId, status: DecisionStatus): Promise<readonly Decision[]>;
}

export interface ITagRepository extends IRepository<Tag> {
  findByWorkspaceId(workspaceId: EntityId): Promise<readonly Tag[]>;
  findByNormalizedName(
    workspaceIdOrNormalizedName: EntityId,
    normalizedName?: string,
  ): Promise<Tag | null>;
  existsByName(
    workspaceId: EntityId,
    normalizedName: string,
    excludeId?: EntityId,
  ): Promise<boolean>;
  searchByName(workspaceIdOrQuery: EntityId, query?: string): Promise<readonly Tag[]>;
}

export interface ISourceRepository extends IRepository<Source> {
  findByProvider(provider: SourceProvider): Promise<readonly Source[]>;
}

export interface IRelationshipRepository extends IRepository<Relationship> {
  findBySourceEntity(
    sourceEntityType: EntityType,
    sourceEntityId: EntityId,
  ): Promise<readonly Relationship[]>;
  findByTargetEntity(
    targetEntityType: EntityType,
    targetEntityId: EntityId,
  ): Promise<readonly Relationship[]>;
  findRelationships(
    sourceEntityId: EntityId,
    relationshipType: RelationshipType,
    targetEntityId?: EntityId,
  ): Promise<readonly Relationship[]>;
}

export interface IActivityEventRepository extends IRepository<ActivityEvent> {
  findByProjectId(projectId: EntityId): Promise<readonly ActivityEvent[]>;
  findByEntity(entityType: EntityType, entityId: EntityId): Promise<readonly ActivityEvent[]>;
  findRecent(limit?: number): Promise<readonly ActivityEvent[]>;
}

export interface IInboxItemRepository extends IRepository<InboxItem> {
  findByStatus(status: InboxStatus): Promise<readonly InboxItem[]>;
  findUnprocessed(): Promise<readonly InboxItem[]>;
}

export interface IAutomationRepository extends IRepository<Automation> {
  findEnabled(workspaceId: EntityId): Promise<readonly Automation[]>;
  findByProjectId(projectId: EntityId): Promise<readonly Automation[]>;
}

export interface IProjectTemplateRepository extends IRepository<ProjectTemplate> {
  findByCategory(category: string): Promise<readonly ProjectTemplate[]>;
  findBuiltin(): Promise<readonly ProjectTemplate[]>;
}
