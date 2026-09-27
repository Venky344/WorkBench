import React, { ReactNode } from 'react';
import { Inbox } from 'lucide-react';
import { Button, ButtonProps } from './Button';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionVariant?: ButtonProps['variant'];
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  actionVariant = 'primary',
  className = '',
}) => {
  return (
    <div
      className={`wb-empty-state ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '3rem 1.5rem',
        borderRadius: 'var(--wb-radius-lg)',
        border: '1px dashed var(--wb-color-border-strong)',
        backgroundColor: 'var(--wb-color-bg-subtle)',
        width: '100%',
        maxWidth: '520px',
        margin: '0 auto',
      }}
    >
      <div
        style={{
          width: '3.5rem',
          height: '3.5rem',
          borderRadius: 'var(--wb-radius-full)',
          backgroundColor: 'var(--wb-color-surface)',
          border: '1px solid var(--wb-color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--wb-color-fg-subtle)',
          marginBottom: '1rem',
        }}
      >
        {icon || <Inbox size={24} />}
      </div>

      <h3
        style={{
          margin: 0,
          fontSize: 'var(--wb-text-base)',
          fontWeight: 'var(--wb-weight-semibold)',
          color: 'var(--wb-color-fg)',
        }}
      >
        {title}
      </h3>

      {description && (
        <p
          style={{
            margin: '0.375rem 0 1.25rem 0',
            fontSize: 'var(--wb-text-sm)',
            color: 'var(--wb-color-fg-muted)',
            maxWidth: '380px',
            lineHeight: 'var(--wb-leading-normal)',
          }}
        >
          {description}
        </p>
      )}

      {actionLabel && onAction && (
        <Button variant={actionVariant} size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
