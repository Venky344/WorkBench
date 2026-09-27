import React, { ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  icon?: ReactNode;
  title?: string;
  message?: string;
  retryLabel?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  icon,
  title = 'Failed to load content',
  message = 'An unexpected error occurred while loading this section.',
  retryLabel = 'Try Again',
  onRetry,
  className = '',
}) => {
  return (
    <div
      role="alert"
      className={`wb-error-state ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2.5rem 1.5rem',
        borderRadius: 'var(--wb-radius-lg)',
        border: '1px solid var(--wb-color-destructive-subtle)',
        backgroundColor: 'rgba(239, 68, 68, 0.05)',
        width: '100%',
        maxWidth: '520px',
        margin: '0 auto',
      }}
    >
      <div
        style={{
          width: '3rem',
          height: '3rem',
          borderRadius: 'var(--wb-radius-full)',
          backgroundColor: 'var(--wb-color-destructive-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--wb-color-destructive)',
          marginBottom: '0.875rem',
        }}
      >
        {icon || <AlertTriangle size={22} />}
      </div>

      <h3
        style={{
          margin: 0,
          fontSize: 'var(--wb-text-base)',
          fontWeight: 'var(--wb-weight-semibold)',
          color: 'var(--wb-color-destructive)',
        }}
      >
        {title}
      </h3>

      {message && (
        <p
          style={{
            margin: '0.375rem 0 1.25rem 0',
            fontSize: 'var(--wb-text-sm)',
            color: 'var(--wb-color-fg-muted)',
            maxWidth: '380px',
            lineHeight: 'var(--wb-leading-normal)',
          }}
        >
          {message}
        </p>
      )}

      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </div>
  );
};
