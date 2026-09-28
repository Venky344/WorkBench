import { createContext } from 'react';
import { ServiceContainer } from '@/services/container';
import { Workspace, User } from '@/domain/entities';

export interface ServiceContextState {
  readonly services: ServiceContainer;
  readonly isReady: boolean;
  readonly error: Error | null;
  readonly workspace: Workspace | null;
  readonly user: User | null;
  readonly refreshWorkspace: () => Promise<void>;
}

export const ServiceContext = createContext<ServiceContextState | null>(null);
