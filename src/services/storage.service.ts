import { BaseService } from './base.service';
import { IStorageEngine } from '@/persistence/storage.interface';
import { IndexedDbStorageEngine } from '@/persistence/indexeddb/indexeddb.storage-engine';
import {
  WorkspaceStorageRepository,
  UserStorageRepository,
  ProjectStorageRepository,
  ChatStorageRepository,
  MessageStorageRepository,
  ChatGroupStorageRepository,
  FileStorageRepository,
  NoteStorageRepository,
  LinkStorageRepository,
  BookmarkStorageRepository,
  ReferenceStorageRepository,
  CodeSnippetStorageRepository,
  TaskStorageRepository,
  DecisionStorageRepository,
  TagStorageRepository,
  SourceStorageRepository,
  RelationshipStorageRepository,
  ActivityEventStorageRepository,
  InboxItemStorageRepository,
  AutomationStorageRepository,
  ProjectTemplateStorageRepository,
} from '@/repositories/storage/entity-repositories.storage';
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
} from '@/repositories/contracts/entity-repositories.contract';

export class StorageService extends BaseService {
  private readonly storage: IStorageEngine;
  private isInitialized = false;

  readonly workspaces: IWorkspaceRepository;
  readonly users: IUserRepository;
  readonly projects: IProjectRepository;
  readonly chats: IChatRepository;
  readonly messages: IMessageRepository;
  readonly chatGroups: IChatGroupRepository;
  readonly files: IFileRepository;
  readonly notes: INoteRepository;
  readonly links: ILinkRepository;
  readonly bookmarks: IBookmarkRepository;
  readonly references: IReferenceRepository;
  readonly codeSnippets: ICodeSnippetRepository;
  readonly tasks: ITaskRepository;
  readonly decisions: IDecisionRepository;
  readonly tags: ITagRepository;
  readonly sources: ISourceRepository;
  readonly relationships: IRelationshipRepository;
  readonly activityEvents: IActivityEventRepository;
  readonly inboxItems: IInboxItemRepository;
  readonly automations: IAutomationRepository;
  readonly projectTemplates: IProjectTemplateRepository;

  constructor(storageEngine?: IStorageEngine) {
    super('StorageService');
    this.storage = storageEngine ?? new IndexedDbStorageEngine();

    this.workspaces = new WorkspaceStorageRepository(this.storage);
    this.users = new UserStorageRepository(this.storage);
    this.projects = new ProjectStorageRepository(this.storage);
    this.chats = new ChatStorageRepository(this.storage);
    this.messages = new MessageStorageRepository(this.storage);
    this.chatGroups = new ChatGroupStorageRepository(this.storage);
    this.files = new FileStorageRepository(this.storage);
    this.notes = new NoteStorageRepository(this.storage);
    this.links = new LinkStorageRepository(this.storage);
    this.bookmarks = new BookmarkStorageRepository(this.storage);
    this.references = new ReferenceStorageRepository(this.storage);
    this.codeSnippets = new CodeSnippetStorageRepository(this.storage);
    this.tasks = new TaskStorageRepository(this.storage);
    this.decisions = new DecisionStorageRepository(this.storage);
    this.tags = new TagStorageRepository(this.storage);
    this.sources = new SourceStorageRepository(this.storage);
    this.relationships = new RelationshipStorageRepository(this.storage);
    this.activityEvents = new ActivityEventStorageRepository(this.storage);
    this.inboxItems = new InboxItemStorageRepository(this.storage);
    this.automations = new AutomationStorageRepository(this.storage);
    this.projectTemplates = new ProjectTemplateStorageRepository(this.storage);
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      this.log.info('Initializing persistence engine...');
      await this.storage.open();
      this.isInitialized = true;
      this.log.info('Persistence engine initialized successfully');
    } catch (error) {
      this.log.error('Failed to initialize persistence engine', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    if (this.isInitialized) {
      await this.storage.close();
      this.isInitialized = false;
      this.log.info('Persistence engine closed');
    }
  }

  getStorageEngine(): IStorageEngine {
    return this.storage;
  }

  isReady(): boolean {
    return this.isInitialized && this.storage.isOpen();
  }
}
