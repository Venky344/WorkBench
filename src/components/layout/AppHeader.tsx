import React from 'react';
import { Breadcrumbs } from './Breadcrumbs';
import { GlobalActions } from './GlobalActions';
import { Button } from '@/components/ui';
import { useAppStore } from '@/stores/app.store';
import { PanelLeft } from 'lucide-react';

export const AppHeader: React.FC = () => {
  const { toggleSidebar, isSidebarCollapsed } = useAppStore();

  return (
    <header
      className="wb-app-header"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '3.5rem',
        padding: '0 1.5rem',
        backgroundColor: 'var(--wb-color-surface)',
        borderBottom: '1px solid var(--wb-color-border)',
        flexShrink: 0,
        zIndex: 'var(--wb-z-sticky)',
        gap: '1rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{ color: 'var(--wb-color-fg-muted)' }}
        >
          <PanelLeft size={18} />
        </Button>

        <Breadcrumbs />
      </div>

      <GlobalActions />
    </header>
  );
};
