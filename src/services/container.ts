import { IStorageEngine } from '@/persistence/storage.interface';
import { StorageService } from './storage.service';
import { WorkspaceService } from './workspace.service';
import { ProjectService } from './project.service';
import { ChatService } from './chat.service';
import { TaskService } from './task.service';
import { DecisionService } from './decision.service';
import { RelationshipService } from './relationship.service';
import { SourceService } from './source.service';
import { InboxService } from './inbox.service';
import { Workspace, User } from '@/domain/entities';

export interface ServiceContainer {
  readonly storageService: StorageService;
  readonly workspaceService: WorkspaceService;
  readonly projectService: ProjectService;
  readonly chatService: ChatService;
  readonly taskService: TaskService;
  readonly decisionService: DecisionService;
  readonly relationshipService: RelationshipService;
  readonly sourceService: SourceService;
  readonly inboxService: InboxService;
  initialize(): Promise<{ workspace: Workspace; user: User }>;
}

export function createServiceContainer(storageEngine?: IStorageEngine): ServiceContainer {
  const storageService = new StorageService(storageEngine);
  const workspaceService = new WorkspaceService(storageService.workspaces, storageService.users);
  const projectService = new ProjectService(storageService.projects);
  const chatService = new ChatService(storageService.chats, storageService.messages);
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
    taskService,
    decisionService,
    relationshipService,
    sourceService,
    inboxService,
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
