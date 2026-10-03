import { useContext } from 'react';
import { ServiceContext } from './ServiceContext';
import { ServiceContainer } from '@/services/container';
import { ProjectService } from '@/services/project.service';
import { WorkspaceService } from '@/services/workspace.service';
import { StorageService } from '@/services/storage.service';
import { ChatService } from '@/services/chat.service';
import { ChatGroupService } from '@/services/chat-group.service';
import { TagService } from '@/services/tag.service';
import { FileService } from '@/services/file.service';
import { NoteService } from '@/services/note.service';
import { LinkService } from '@/services/link.service';
import { BookmarkService } from '@/services/bookmark.service';
import { ReferenceService } from '@/services/reference.service';
import { CodeSnippetService } from '@/services/code-snippet.service';
import { TaskService } from '@/services/task.service';
import { DecisionService } from '@/services/decision.service';
import { Workspace, User } from '@/domain/entities';

export interface WorkspaceContextValue {
  readonly workspace: Workspace | null;
  readonly user: User | null;
  readonly isReady: boolean;
  readonly refreshWorkspace: () => Promise<void>;
}

export const useOptionalServices = (): ServiceContainer | null => {
  const context = useContext(ServiceContext);
  return context ? context.services : null;
};

export const useServices = (): ServiceContainer => {
  const context = useContext(ServiceContext);
  if (!context) {
    throw new Error('useServices must be used within a ServiceProvider');
  }
  return context.services;
};

export const useProjectService = (): ProjectService => {
  return useServices().projectService;
};

export const useChatService = (): ChatService => {
  return useServices().chatService;
};

export const useChatGroupService = (): ChatGroupService => {
  return useServices().chatGroupService;
};

export const useTagService = (): TagService => {
  return useServices().tagService;
};

export const useWorkspaceService = (): WorkspaceService => {
  return useServices().workspaceService;
};

export const useStorageService = (): StorageService => {
  return useServices().storageService;
};

export const useFileService = (): FileService => {
  return useServices().fileService;
};

export const useNoteService = (): NoteService => {
  return useServices().noteService;
};

export const useLinkService = (): LinkService => {
  return useServices().linkService;
};

export const useBookmarkService = (): BookmarkService => {
  return useServices().bookmarkService;
};

export const useReferenceService = (): ReferenceService => {
  return useServices().referenceService;
};

export const useCodeSnippetService = (): CodeSnippetService => {
  return useServices().codeSnippetService;
};

export const useTaskService = (): TaskService => {
  return useServices().taskService;
};

export const useDecisionService = (): DecisionService => {
  return useServices().decisionService;
};

export const useWorkspaceContext = (): WorkspaceContextValue => {
  const context = useContext(ServiceContext);
  if (!context) {
    throw new Error('useWorkspaceContext must be used within a ServiceProvider');
  }
  return {
    workspace: context.workspace,
    user: context.user,
    isReady: context.isReady,
    refreshWorkspace: context.refreshWorkspace,
  };
};
