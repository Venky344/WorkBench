import { IStorageEngine } from '@/persistence/storage.interface';
import { StorageService } from './storage.service';
import { WorkspaceService } from './workspace.service';
import { ProjectService } from './project.service';
import { ChatService } from './chat.service';
import { ChatGroupService } from './chat-group.service';
import { TagService } from './tag.service';
import { TaskService } from './task.service';
import { DecisionService } from './decision.service';
import { RelationshipService } from './relationship.service';
import { SourceService } from './source.service';
import { InboxService } from './inbox.service';
import { FileService } from './file.service';
import { NoteService } from './note.service';
import { LinkService } from './link.service';
import { BookmarkService } from './bookmark.service';
import { ReferenceService } from './reference.service';
import { CodeSnippetService } from './code-snippet.service';
import { Workspace, User } from '@/domain/entities';

export interface ServiceContainer {
  readonly storageService: StorageService;
  readonly workspaceService: WorkspaceService;
  readonly projectService: ProjectService;
  readonly chatService: ChatService;
  readonly chatGroupService: ChatGroupService;
  readonly tagService: TagService;
  readonly taskService: TaskService;
  readonly decisionService: DecisionService;
  readonly relationshipService: RelationshipService;
  readonly sourceService: SourceService;
  readonly inboxService: InboxService;
  readonly fileService: FileService;
  readonly noteService: NoteService;
  readonly linkService: LinkService;
  readonly bookmarkService: BookmarkService;
  readonly referenceService: ReferenceService;
  readonly codeSnippetService: CodeSnippetService;
  initialize(): Promise<{ workspace: Workspace; user: User }>;
}

export function createServiceContainer(storageEngine?: IStorageEngine): ServiceContainer {
  const storageService = new StorageService(storageEngine);
  const workspaceService = new WorkspaceService(storageService.workspaces, storageService.users);
  const projectService = new ProjectService(storageService.projects);
  const chatService = new ChatService(
    storageService.chats,
    storageService.messages,
    storageService.chatGroups,
  );
  const chatGroupService = new ChatGroupService(
    storageService.chatGroups,
    storageService.chats,
    storageService.projects,
  );
  const fileService = new FileService(storageService.files, storageService.fileStorage);
  const noteService = new NoteService(storageService.notes);
  const linkService = new LinkService(storageService.links);
  const bookmarkService = new BookmarkService(storageService.bookmarks);
  const referenceService = new ReferenceService(storageService.references);
  const codeSnippetService = new CodeSnippetService(storageService.codeSnippets);
  const tagService = new TagService(
    storageService.tags,
    storageService.projects,
    storageService.chats,
    storageService.files,
    storageService.notes,
    storageService.links,
    storageService.bookmarks,
    storageService.references,
    storageService.codeSnippets,
    storageService.tasks,
    storageService.decisions,
  );
  const taskService = new TaskService(storageService.tasks);
  const decisionService = new DecisionService(storageService.decisions);
  const relationshipService = new RelationshipService(storageService.relationships);
  const sourceService = new SourceService(storageService.sources);
  const inboxService = new InboxService(storageService.inboxItems);

  let initPromise: Promise<{ workspace: Workspace; user: User }> | null = null;

  return {
    storageService,
    workspaceService,
    projectService,
    chatService,
    chatGroupService,
    tagService,
    taskService,
    decisionService,
    relationshipService,
    sourceService,
    inboxService,
    fileService,
    noteService,
    linkService,
    bookmarkService,
    referenceService,
    codeSnippetService,
    async initialize() {
      if (!initPromise) {
        initPromise = (async () => {
          await storageService.initialize();
          const { workspace, user } = await workspaceService.getOrCreateDefaultWorkspace();
          return { workspace, user };
        })();
      }
      return initPromise;
    },
  };
}

// Global default container for the browser application
let defaultContainer: ServiceContainer | null = null;

export function getDefaultServices(): ServiceContainer {
  if (!defaultContainer) {
    defaultContainer = createServiceContainer();
  }
  return defaultContainer;
}

export function resetDefaultServices(): void {
  defaultContainer = null;
}
