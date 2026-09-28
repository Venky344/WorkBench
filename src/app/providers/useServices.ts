import { useContext } from 'react';
import { ServiceContext } from './ServiceContext';
import { ServiceContainer } from '@/services/container';
import { ProjectService } from '@/services/project.service';
import { WorkspaceService } from '@/services/workspace.service';
import { StorageService } from '@/services/storage.service';
import { ChatService } from '@/services/chat.service';
import { ChatGroupService } from '@/services/chat-group.service';
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

export const useWorkspaceService = (): WorkspaceService => {
  return useServices().workspaceService;
};

export const useStorageService = (): StorageService => {
  return useServices().storageService;
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
