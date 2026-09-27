import React from 'react';
import { appConfig } from '@/app/config/app.config';

export const HomePage: React.FC = () => {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      <div
        style={{
          backgroundColor: '#111827',
          border: '1px solid #1f2937',
          borderRadius: '12px',
          padding: '2rem',
        }}
      >
        <h2 style={{ margin: '0 0 0.5rem 0', color: '#f8fafc', fontSize: '1.5rem' }}>
          WorkBench Architecture Foundation
        </h2>
        <p style={{ color: '#94a3b8', lineHeight: '1.6', margin: '0 0 1.5rem 0' }}>
          Phase 1 foundational architecture is active. The application structure, strict TypeScript
          configuration, modular layers, repository abstractions, error handling, structured
          logging, and routing are verified.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ backgroundColor: '#1e293b', padding: '1rem', borderRadius: '8px' }}>
            <div style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>
              Environment
            </div>
            <div style={{ color: '#38bdf8', fontWeight: 600, marginTop: '0.25rem' }}>
              {appConfig.environment}
            </div>
          </div>
          <div style={{ backgroundColor: '#1e293b', padding: '1rem', borderRadius: '8px' }}>
            <div style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>
              Routing
            </div>
            <div style={{ color: '#38bdf8', fontWeight: 600, marginTop: '0.25rem' }}>
              React Router v6
            </div>
          </div>
          <div style={{ backgroundColor: '#1e293b', padding: '1rem', borderRadius: '8px' }}>
            <div style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>
              State Foundation
            </div>
            <div style={{ color: '#38bdf8', fontWeight: 600, marginTop: '0.25rem' }}>Zustand</div>
          </div>
          <div style={{ backgroundColor: '#1e293b', padding: '1rem', borderRadius: '8px' }}>
            <div style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>
              Next Phase
            </div>
            <div style={{ color: '#38bdf8', fontWeight: 600, marginTop: '0.25rem' }}>
              Phase 2 (Design System)
            </div>
          </div>
        </div>

        <div
          style={{
            borderTop: '1px solid #1f2937',
            paddingTop: '1rem',
            color: '#64748b',
            fontSize: '0.85rem',
          }}
        >
          Product UI, project workspaces, and persistence layers will be introduced in subsequent
          roadmap phases.
        </div>
      </div>
    </div>
  );
};
