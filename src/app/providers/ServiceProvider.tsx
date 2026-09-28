import React, { useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { ServiceContainer, getDefaultServices } from '@/services/container';
import { Workspace, User } from '@/domain/entities';
import { ServiceContext, ServiceContextState } from './ServiceContext';

export interface ServiceProviderProps {
  readonly children: ReactNode;
  readonly services?: ServiceContainer;
}

export const ServiceProvider: React.FC<ServiceProviderProps> = ({
  children,
  services: customServices,
}) => {
  const [services] = useState<ServiceContainer>(() => customServices ?? getDefaultServices());
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const init = useCallback(async () => {
    try {
      await services.initialize();
      const wsData = await services.workspaceService.getOrCreateDefaultWorkspace();
      setWorkspace(wsData.workspace);
      setUser(wsData.user);
      setIsReady(true);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsReady(true);
    }
  }, [services]);

  useEffect(() => {
    void init();
  }, [init]);

  const refreshWorkspace = useCallback(async () => {
    try {
      const wsData = await services.workspaceService.getOrCreateDefaultWorkspace();
      setWorkspace(wsData.workspace);
      setUser(wsData.user);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  }, [services]);

  const value = useMemo<ServiceContextState>(
    () => ({
      services,
      isReady,
      error,
      workspace,
      user,
      refreshWorkspace,
    }),
    [services, isReady, error, workspace, user, refreshWorkspace],
  );

  return <ServiceContext.Provider value={value}>{children}</ServiceContext.Provider>;
};
