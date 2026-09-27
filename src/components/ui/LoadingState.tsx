import React from 'react';
import { Loader2 } from 'lucide-react';

export interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading workspace data...',
  size = 'md',
  className = '',
}) => {
  const iconSize = size === 'sm' ? 18 : size === 'lg' ? 32 : 24;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`wb-loading-state ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem 1.5rem',
        gap: '0.875rem',
        color: 'var(--wb-color-fg-muted)',
        width: '100%',
      }}
    >
      <Loader2
        size={iconSize}
        color="var(--wb-color-primary)"
        style={{ animation: 'wb-spin 1s linear infinite' }}
      />
      {message && (
        <span
          style={{
            fontSize: size === 'sm' ? 'var(--wb-text-xs)' : 'var(--wb-text-sm)',
            fontWeight: 'var(--wb-weight-medium)',
          }}
        >
          {message}
        </span>
      )}
    </div>
  );
};
