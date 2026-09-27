import React, { ReactNode } from 'react';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return <ErrorBoundary>{children}</ErrorBoundary>;
};
