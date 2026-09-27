import React from 'react';
import { env } from '@/utils/env';

export interface FallbackViewProps {
  error: Error;
  resetErrorBoundary?: () => void;
}

export const FallbackView: React.FC<FallbackViewProps> = ({ error, resetErrorBoundary }) => {
  return (
    <div
      role="alert"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '2rem',
        backgroundColor: '#0f172a',
        color: '#f8fafc',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: '560px',
          width: '100%',
          backgroundColor: '#1e293b',
          borderRadius: '12px',
          padding: '2rem',
          border: '1px solid #334155',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}
        >
          <span style={{ fontSize: '1.5rem' }}>⚠️</span>
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#f87171' }}>
            WorkBench Encountered an Error
          </h2>
        </div>
        <p
          style={{
            color: '#94a3b8',
            fontSize: '0.95rem',
            lineHeight: '1.5',
            margin: '0 0 1.5rem 0',
          }}
        >
          An unexpected error occurred in the workspace. You can try refreshing or resetting the
          view.
        </p>

        {!env.IS_PROD && (
          <pre
            style={{
              backgroundColor: '#020617',
              color: '#fca5a5',
              padding: '1rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              overflowX: 'auto',
              marginBottom: '1.5rem',
              border: '1px solid #991b1b',
            }}
          >
            {error.message}
            {error.stack ? `\n\n${error.stack}` : ''}
          </pre>
        )}

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          {resetErrorBoundary && (
            <button
              onClick={resetErrorBoundary}
              style={{
                backgroundColor: '#38bdf8',
                color: '#0f172a',
                border: 'none',
                borderRadius: '6px',
                padding: '0.5rem 1.25rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
