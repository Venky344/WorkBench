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
        backgroundColor: '#090d16',
        color: '#f1f5f9',
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1.5rem',
          backgroundColor: '#111827',
          borderBottom: '1px solid #1f2937',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={toggleSidebar}
            data-testid="toggle-sidebar-btn"
            style={{
              background: 'transparent',
              border: '1px solid #374151',
              color: '#9ca3af',
              borderRadius: '6px',
              padding: '0.35rem 0.65rem',
              cursor: 'pointer',
            }}
            title="Toggle Sidebar"
          >
            {isSidebarCollapsed ? '☰' : '✕'}
          </button>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <h1 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#38bdf8' }}>
              {appConfig.name}
            </h1>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              v{appConfig.version} (Phase 1 Foundation)
            </span>
          </div>
        </div>

        <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link
            to="/"
            style={{
              color: '#93c5fd',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: 500,
            }}
          >
            Overview
          </Link>
          <span
            style={{
              fontSize: '0.75rem',
              padding: '0.2rem 0.6rem',
              backgroundColor: '#064e3b',
              color: '#6ee7b7',
              borderRadius: '9999px',
              fontWeight: 600,
            }}
          >
            Phase 1 Foundation Ready
          </span>
        </nav>
      </header>

      <main style={{ flex: 1, display: 'flex', padding: '1.5rem' }}>
        <Outlet />
      </main>
    </div>
  );
};
