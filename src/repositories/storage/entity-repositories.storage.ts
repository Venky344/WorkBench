import { StorageRepository } from './storage.repository';
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
import {
  IWorkspaceRepository,
  IUserRepository,
  IProjectRepository,
  IChatRepository,
  IMessageRepository,
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
  ISourceRepository,
  IRelationshipRepository,
  IActivityEventRepository,
  IInboxItemRepository,
  IAutomationRepository,
  IProjectTemplateRepository,
} from '../contracts/entity-repositories.contract';
import { IStorageEngine } from '@/persistence/storage.interface';
import { STORES } from '@/persistence/schema';
import { EntityId } from '@/types';
import { SourceProvider } from '@/domain/value-objects/provenance';

export class WorkspaceStorageRepository
  extends StorageRepository<Workspace>
  implements IWorkspaceRepository
{
  constructor(storage: IStorageEngine) {
    super(storage, STORES.WORKSPACES, 'Workspace');
  }

  async findDefault(): Promise<Workspace | null> {
    const all = await this.findAll();
    return all[0] ?? null;
  }
}

export class UserStorageRepository extends StorageRepository<User> implements IUserRepository {
  constructor(storage: IStorageEngine) {
    super(storage, STORES.USERS, 'User');
  }

  async findByWorkspaceId(workspaceId: EntityId): Promise<readonly User[]> {
    return this.storage.find<User>(this.storeName, {
      indexName: 'by_workspaceId',
      indexValue: workspaceId,
    });
  }
}

export class ProjectStorageRepository
  extends StorageRepository<Project>
  implements IProjectRepository
{
  constructor(storage: IStorageEngine) {
    super(storage, STORES.PROJECTS, 'Project');
  }

  async findBySlug(slug: string): Promise<Project | null> {
    const results = await this.storage.find<Project>(this.storeName, {
      indexName: 'by_slug',
      indexValue: slug,
      limit: 1,
    });
    return results[0] ?? null;
  }

  async findByWorkspaceId(workspaceId: EntityId): Promise<readonly Project[]> {
    return this.storage.find<Project>(this.storeName, {
      indexName: 'by_workspaceId',
      indexValue: workspaceId,
    });
  }

  async findActive(workspaceId: EntityId): Promise<readonly Project[]> {
    return this.storage.find<Project>(this.storeName, {
      predicate: (p) => p.workspaceId === workspaceId && !p.isArchived,
    });
  }

  async findArchived(workspaceId: EntityId): Promise<readonly Project[]> {
    return this.storage.find<Project>(this.storeName, {
      predicate: (p) => p.workspaceId === workspaceId && p.isArchived,
    });
  }

  async findPinned(workspaceId: EntityId): Promise<readonly Project[]> {
    return this.storage.find<Project>(this.storeName, {
      predicate: (p) => p.workspaceId === workspaceId && p.isPinned && !p.isArchived,
    });
  }

  async existsByName(workspaceId: EntityId, name: string, excludeId?: EntityId): Promise<boolean> {
    const trimmed = name.trim().toLowerCase();
    const results = await this.storage.find<Project>(this.storeName, {
      predicate: (p) =>
        p.workspaceId === workspaceId &&
        p.name.trim().toLowerCase() === trimmed &&
        (!excludeId || p.id !== excludeId),
    });
    return results.length > 0;
  }
}

export class ChatStorageRepository extends StorageRepository<Chat> implements IChatRepository {
  constructor(storage: IStorageEngine) {
    super(storage, STORES.CHATS, 'Chat');
  }

  async findByProjectId(projectId: EntityId): Promise<readonly Chat[]> {
    return this.storage.find<Chat>(this.storeName, {
      indexName: 'by_projectId',
      indexValue: projectId,
    });
  }

  async findByWorkspaceId(workspaceId: EntityId): Promise<readonly Chat[]> {
    return this.storage.find<Chat>(this.storeName, {
      indexName: 'by_workspaceId',
      indexValue: workspaceId,
    });
  }

  async findByChatGroupId(chatGroupId: EntityId): Promise<readonly Chat[]> {
    return this.storage.find<Chat>(this.storeName, {
      indexName: 'by_chatGroupId',
      indexValue: chatGroupId,
    });
  }

  async findBySourceId(sourceId: EntityId): Promise<readonly Chat[]> {
    return this.storage.find<Chat>(this.storeName, {
      indexName: 'by_sourceId',
      indexValue: sourceId,
    });
  }

  async findActive(projectId: EntityId): Promise<readonly Chat[]> {
    return this.storage.find<Chat>(this.storeName, {
      predicate: (c) => c.projectId === projectId && !c.isArchived,
    });
  }

  async findPinned(projectId: EntityId): Promise<readonly Chat[]> {
    return this.storage.find<Chat>(this.storeName, {
      predicate: (c) => c.projectId === projectId && c.isPinned && !c.isArchived,
    });
  }

  async findFavorites(projectId: EntityId): Promise<readonly Chat[]> {
    return this.storage.find<Chat>(this.storeName, {
      predicate: (c) => c.projectId === projectId && c.isFavorite && !c.isArchived,
    });
  }

  async findArchived(projectId: EntityId): Promise<readonly Chat[]> {
    return this.storage.find<Chat>(this.storeName, {
      predicate: (c) => c.projectId === projectId && c.isArchived,
    });
  }

  async findUngrouped(projectId: EntityId): Promise<readonly Chat[]> {
    return this.storage.find<Chat>(this.storeName, {
      predicate: (c) => c.projectId === projectId && !c.chatGroupId && !c.isArchived,
    });
  }
}

export class MessageStorageRepository
  extends StorageRepository<Message>
  implements IMessageRepository
{
  constructor(storage: IStorageEngine) {
    super(storage, STORES.MESSAGES, 'Message');
  }

  async findByChatId(chatId: EntityId): Promise<readonly Message[]> {
    const messages = await this.storage.find<Message>(this.storeName, {
      indexName: 'by_chatId',
      indexValue: chatId,
    });
    return [...messages].sort((a, b) => a.sequenceNumber - b.sequenceNumber);
  }

  async findByRole(chatId: EntityId, role: MessageRole): Promise<readonly Message[]> {
    return this.storage.find<Message>(this.storeName, {
      predicate: (m) => m.chatId === chatId && m.role === role,
    });
  }

  async deleteByChatId(chatId: EntityId): Promise<number> {
    const messages = await this.findByChatId(chatId);
    const ids = messages.map((m) => m.id);
    return this.deleteBatch(ids);
  }
}

export class ChatGroupStorageRepository
  extends StorageRepository<ChatGroup>
  implements IChatGroupRepository
{
  constructor(storage: IStorageEngine) {
    super(storage, STORES.CHAT_GROUPS, 'ChatGroup');
  }

  async findByProjectId(projectId: EntityId): Promise<readonly ChatGroup[]> {
    const groups = await this.storage.find<ChatGroup>(this.storeName, {
      indexName: 'by_projectId',
      indexValue: projectId,
    });
    return [...groups].sort((a, b) => a.order - b.order);
  }

  async findPinned(projectId: EntityId): Promise<readonly ChatGroup[]> {
    const groups = await this.storage.find<ChatGroup>(this.storeName, {
      predicate: (g) => g.projectId === projectId && !!g.isPinned,
    });
    return [...groups].sort((a, b) => a.order - b.order);
  }

  async existsByName(projectId: EntityId, name: string, excludeId?: EntityId): Promise<boolean> {
    const trimmed = name.trim().toLowerCase();
    const results = await this.storage.find<ChatGroup>(this.storeName, {
      predicate: (g) =>
        g.projectId === projectId &&
        g.name.trim().toLowerCase() === trimmed &&
        (!excludeId || g.id !== excludeId),
    });
    return results.length > 0;
  }
}

export class FileStorageRepository
  extends StorageRepository<FileEntity>
  implements IFileRepository
{
  constructor(storage: IStorageEngine) {
    super(storage, STORES.FILES, 'File');
  }

  async findByProjectId(projectId: EntityId): Promise<readonly FileEntity[]> {
    return this.storage.find<FileEntity>(this.storeName, {
      indexName: 'by_projectId',
      indexValue: projectId,
    });
  }

  async findBySourceId(sourceId: EntityId): Promise<readonly FileEntity[]> {
    return this.storage.find<FileEntity>(this.storeName, {
      indexName: 'by_sourceId',
      indexValue: sourceId,
    });
  }
}

export class NoteStorageRepository extends StorageRepository<Note> implements INoteRepository {
  constructor(storage: IStorageEngine) {
    super(storage, STORES.NOTES, 'Note');
  }

  async findByProjectId(projectId: EntityId): Promise<readonly Note[]> {
    return this.storage.find<Note>(this.storeName, {
      indexName: 'by_projectId',
      indexValue: projectId,
    });
  }

  async findPinned(projectId: EntityId): Promise<readonly Note[]> {
    return this.storage.find<Note>(this.storeName, {
      predicate: (n) => n.projectId === projectId && n.isPinned,
    });
  }
}

export class LinkStorageRepository extends StorageRepository<Link> implements ILinkRepository {
  constructor(storage: IStorageEngine) {
    super(storage, STORES.LINKS, 'Link');
  }

  async findByProjectId(projectId: EntityId): Promise<readonly Link[]> {
    return this.storage.find<Link>(this.storeName, {
      indexName: 'by_projectId',
      indexValue: projectId,
    });
  }

  async findByDomain(domain: string): Promise<readonly Link[]> {
    return this.storage.find<Link>(this.storeName, {
      indexName: 'by_domain',
      indexValue: domain,
    });
  }
}

export class BookmarkStorageRepository
  extends StorageRepository<Bookmark>
  implements IBookmarkRepository
{
  constructor(storage: IStorageEngine) {
    super(storage, STORES.BOOKMARKS, 'Bookmark');
  }

  async findByProjectId(projectId: EntityId): Promise<readonly Bookmark[]> {
    return this.storage.find<Bookmark>(this.storeName, {
      indexName: 'by_projectId',
      indexValue: projectId,
    });
  }

  async findByTarget(
    targetEntityType: EntityType,
    targetEntityId: EntityId,
  ): Promise<readonly Bookmark[]> {
    return this.storage.find<Bookmark>(this.storeName, {
      predicate: (b) =>
        b.targetEntityType === targetEntityType && b.targetEntityId === targetEntityId,
    });
  }
}

export class ReferenceStorageRepository
  extends StorageRepository<Reference>
  implements IReferenceRepository
{
  constructor(storage: IStorageEngine) {
    super(storage, STORES.REFERENCES, 'Reference');
  }

  async findByProjectId(projectId: EntityId): Promise<readonly Reference[]> {
    return this.storage.find<Reference>(this.storeName, {
      indexName: 'by_projectId',
      indexValue: projectId,
    });
  }

  async findBySourceEntity(
    sourceEntityType: EntityType,
    sourceEntityId: EntityId,
  ): Promise<readonly Reference[]> {
    return this.storage.find<Reference>(this.storeName, {
      predicate: (r) =>
        r.sourceEntityType === sourceEntityType && r.sourceEntityId === sourceEntityId,
    });
  }
}

export class CodeSnippetStorageRepository
  extends StorageRepository<CodeSnippet>
  implements ICodeSnippetRepository
{
  constructor(storage: IStorageEngine) {
    super(storage, STORES.CODE_SNIPPETS, 'CodeSnippet');
  }

  async findByProjectId(projectId: EntityId): Promise<readonly CodeSnippet[]> {
    return this.storage.find<CodeSnippet>(this.storeName, {
      indexName: 'by_projectId',
      indexValue: projectId,
    });
  }

  async findByLanguage(language: string): Promise<readonly CodeSnippet[]> {
    return this.storage.find<CodeSnippet>(this.storeName, {
      indexName: 'by_language',
      indexValue: language,
    });
  }

  async findByChatId(chatId: EntityId): Promise<readonly CodeSnippet[]> {
    return this.storage.find<CodeSnippet>(this.storeName, {
      indexName: 'by_chatId',
      indexValue: chatId,
    });
  }
}

export class TaskStorageRepository extends StorageRepository<Task> implements ITaskRepository {
  constructor(storage: IStorageEngine) {
    super(storage, STORES.TASKS, 'Task');
  }

  async findByProjectId(projectId: EntityId): Promise<readonly Task[]> {
    return this.storage.find<Task>(this.storeName, {
      indexName: 'by_projectId',
      indexValue: projectId,
    });
  }

  async findByStatus(projectId: EntityId, status: TaskStatus): Promise<readonly Task[]> {
    return this.storage.find<Task>(this.storeName, {
      predicate: (t) => t.projectId === projectId && t.status === status,
    });
  }

  async findByDecisionId(decisionId: EntityId): Promise<readonly Task[]> {
    return this.storage.find<Task>(this.storeName, {
      predicate: (t) => t.decisionId === decisionId,
    });
  }
}

export class DecisionStorageRepository
  extends StorageRepository<Decision>
  implements IDecisionRepository
{
  constructor(storage: IStorageEngine) {
    super(storage, STORES.DECISIONS, 'Decision');
  }

  async findByProjectId(projectId: EntityId): Promise<readonly Decision[]> {
    return this.storage.find<Decision>(this.storeName, {
      indexName: 'by_projectId',
      indexValue: projectId,
    });
  }

  async findByStatus(projectId: EntityId, status: DecisionStatus): Promise<readonly Decision[]> {
    return this.storage.find<Decision>(this.storeName, {
      predicate: (d) => d.projectId === projectId && d.status === status,
    });
  }
}

export class TagStorageRepository extends StorageRepository<Tag> implements ITagRepository {
  constructor(storage: IStorageEngine) {
    super(storage, STORES.TAGS, 'Tag');
  }

  async findByNormalizedName(normalizedName: string): Promise<Tag | null> {
    const results = await this.storage.find<Tag>(this.storeName, {
      indexName: 'by_normalizedName',
      indexValue: normalizedName,
      limit: 1,
    });
    return results[0] ?? null;
  }

  async searchByName(query: string): Promise<readonly Tag[]> {
    const normalized = query.toLowerCase().trim().replace(/^#/, '');
    return this.storage.find<Tag>(this.storeName, {
      predicate: (t) =>
        t.normalizedName.includes(normalized) || t.name.toLowerCase().includes(normalized),
    });
  }
}

export class SourceStorageRepository
  extends StorageRepository<Source>
  implements ISourceRepository
{
  constructor(storage: IStorageEngine) {
    super(storage, STORES.SOURCES, 'Source');
  }

  async findByProvider(provider: SourceProvider): Promise<readonly Source[]> {
    return this.storage.find<Source>(this.storeName, {
      indexName: 'by_provider',
      indexValue: provider,
    });
  }
}

export class RelationshipStorageRepository
  extends StorageRepository<Relationship>
  implements IRelationshipRepository
{
  constructor(storage: IStorageEngine) {
    super(storage, STORES.RELATIONSHIPS, 'Relationship');
  }

  async findBySourceEntity(
    sourceEntityType: EntityType,
    sourceEntityId: EntityId,
  ): Promise<readonly Relationship[]> {
    return this.storage.find<Relationship>(this.storeName, {
      predicate: (r) =>
        r.sourceEntityType === sourceEntityType && r.sourceEntityId === sourceEntityId,
    });
  }

  async findByTargetEntity(
    targetEntityType: EntityType,
    targetEntityId: EntityId,
  ): Promise<readonly Relationship[]> {
    return this.storage.find<Relationship>(this.storeName, {
      predicate: (r) =>
        r.targetEntityType === targetEntityType && r.targetEntityId === targetEntityId,
    });
  }

  async findRelationships(
    sourceEntityId: EntityId,
    relationshipType: RelationshipType,
    targetEntityId?: EntityId,
  ): Promise<readonly Relationship[]> {
    return this.storage.find<Relationship>(this.storeName, {
      predicate: (r) =>
        r.sourceEntityId === sourceEntityId &&
        r.relationshipType === relationshipType &&
        (!targetEntityId || r.targetEntityId === targetEntityId),
    });
  }
}

export class ActivityEventStorageRepository
  extends StorageRepository<ActivityEvent>
  implements IActivityEventRepository
{
  constructor(storage: IStorageEngine) {
    super(storage, STORES.ACTIVITY_EVENTS, 'ActivityEvent');
  }

  async findByProjectId(projectId: EntityId): Promise<readonly ActivityEvent[]> {
    return this.storage.find<ActivityEvent>(this.storeName, {
      indexName: 'by_projectId',
      indexValue: projectId,
    });
  }

  async findByEntity(
    entityType: EntityType,
    entityId: EntityId,
  ): Promise<readonly ActivityEvent[]> {
    return this.storage.find<ActivityEvent>(this.storeName, {
      predicate: (e) => e.entityType === entityType && e.entityId === entityId,
    });
  }

  async findRecent(limit = 50): Promise<readonly ActivityEvent[]> {
    const events = await this.findAll();
    return [...events]
      .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp))
      .slice(0, limit);
  }
}

export class InboxItemStorageRepository
  extends StorageRepository<InboxItem>
  implements IInboxItemRepository
{
  constructor(storage: IStorageEngine) {
    super(storage, STORES.INBOX_ITEMS, 'InboxItem');
  }

  async findByStatus(status: InboxStatus): Promise<readonly InboxItem[]> {
    return this.storage.find<InboxItem>(this.storeName, {
      indexName: 'by_status',
      indexValue: status,
    });
  }

  async findUnprocessed(): Promise<readonly InboxItem[]> {
    return this.findByStatus('unprocessed');
  }
}

export class AutomationStorageRepository
  extends StorageRepository<Automation>
  implements IAutomationRepository
{
  constructor(storage: IStorageEngine) {
    super(storage, STORES.AUTOMATIONS, 'Automation');
  }

  async findEnabled(workspaceId: EntityId): Promise<readonly Automation[]> {
    return this.storage.find<Automation>(this.storeName, {
      predicate: (a) => a.workspaceId === workspaceId && a.isEnabled,
    });
  }

  async findByProjectId(projectId: EntityId): Promise<readonly Automation[]> {
    return this.storage.find<Automation>(this.storeName, {
      indexName: 'by_projectId',
      indexValue: projectId,
    });
  }
}

export class ProjectTemplateStorageRepository
  extends StorageRepository<ProjectTemplate>
  implements IProjectTemplateRepository
{
  constructor(storage: IStorageEngine) {
    super(storage, STORES.PROJECT_TEMPLATES, 'ProjectTemplate');
  }

  async findByCategory(category: string): Promise<readonly ProjectTemplate[]> {
    return this.storage.find<ProjectTemplate>(this.storeName, {
      indexName: 'by_category',
      indexValue: category,
    });
  }

  async findBuiltin(): Promise<readonly ProjectTemplate[]> {
    return this.storage.find<ProjectTemplate>(this.storeName, {
      predicate: (t) => t.isBuiltin,
    });
  }
}
