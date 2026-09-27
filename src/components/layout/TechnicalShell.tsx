import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { appConfig } from '@/app/config/app.config';
import { useAppStore } from '@/stores/app.store';

export const TechnicalShell: React.FC = () => {
  const { isSidebarCollapsed, toggleSidebar } = useAppStore();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: 'var(--wb-color-bg)',
        color: 'var(--wb-color-fg)',
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1.5rem',
          backgroundColor: 'var(--wb-color-surface)',
          borderBottom: '1px solid var(--wb-color-border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={toggleSidebar}
            data-testid="toggle-sidebar-btn"
            style={{
              background: 'transparent',
              border: '1px solid var(--wb-color-border)',
              color: 'var(--wb-color-fg-muted)',
              borderRadius: 'var(--wb-radius-md)',
              padding: '0.35rem 0.65rem',
              cursor: 'pointer',
            }}
            title="Toggle Sidebar"
          >
            {isSidebarCollapsed ? '☰' : '✕'}
          </button>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <h1
              style={{
                margin: 0,
                fontSize: 'var(--wb-text-lg)',
                fontWeight: 'var(--wb-weight-bold)',
                color: 'var(--wb-color-primary)',
              }}
            >
              {appConfig.name}
            </h1>
            <span style={{ fontSize: 'var(--wb-text-xs)', color: 'var(--wb-color-fg-subtle)' }}>
              v{appConfig.version} (Phase 2 Design System)
            </span>
          </div>
        </div>

        <nav style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
          <Link
            to="/"
            style={{
              color: 'var(--wb-color-fg-muted)',
              textDecoration: 'none',
              fontSize: 'var(--wb-text-sm)',
              fontWeight: 'var(--wb-weight-medium)',
            }}
          >
            Overview
          </Link>
          <Link
            to="/showcase"
            style={{
              color: 'var(--wb-color-primary)',
              textDecoration: 'none',
              fontSize: 'var(--wb-text-sm)',
              fontWeight: 'var(--wb-weight-medium)',
            }}
          >
            Design System Showcase
          </Link>
          <span
            style={{
              fontSize: 'var(--wb-text-xs)',
              padding: '0.2rem 0.6rem',
              backgroundColor: 'var(--wb-color-success-subtle)',
              color: 'var(--wb-color-success)',
              borderRadius: 'var(--wb-radius-full)',
              fontWeight: 'var(--wb-weight-semibold)',
            }}
          >
            Phase 2 Design System Ready
          </span>
        </nav>
      </header>

      <main style={{ flex: 1, display: 'flex', padding: '1.5rem' }}>
        <Outlet />
      </main>
    </div>
  );
};
