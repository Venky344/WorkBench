import React, { ReactNode } from 'react';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { ToastContainer } from '@/components/ui/Toast';
import { ServiceProvider } from './ServiceProvider';

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <ErrorBoundary>
      <ServiceProvider>
        {children}
        <ToastContainer />
      </ServiceProvider>
    </ErrorBoundary>
  );
};
