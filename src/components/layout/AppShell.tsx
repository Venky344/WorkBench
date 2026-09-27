import React from 'react';
import { Outlet } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';
import { CommandPaletteModal } from './CommandPaletteModal';
import { QuickCaptureModal } from './QuickCaptureModal';
import { ErrorBoundary } from '@/components/ui';

export const AppShell: React.FC = () => {
  return (
    <div
      className="wb-app-shell"
      style={{
        display: 'flex',
        minHeight: '100vh',
        width: '100vw',
        backgroundColor: 'var(--wb-color-bg)',
        color: 'var(--wb-color-fg)',
        overflow: 'hidden',
      }}
    >
      {/* 1. App Sidebar */}
      <AppSidebar />

      {/* 2. Main Workspace Layout Area */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minWidth: 0,
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        {/* Top Header */}
        <AppHeader />

        {/* Scrollable Content Viewport */}
        <main
          className="wb-main-content"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.75rem',
            backgroundColor: 'var(--wb-color-bg)',
          }}
        >
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>

      {/* Global Modals */}
      <CommandPaletteModal />
      <QuickCaptureModal />
    </div>
  );
};
