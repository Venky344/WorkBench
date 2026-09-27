import React, { HTMLAttributes } from 'react';

export interface SeparatorProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  label?: string;
}

export const Separator: React.FC<SeparatorProps> = ({
  orientation = 'horizontal',
  label,
  className = '',
  style,
  ...props
}) => {
  if (orientation === 'vertical') {
    return (
      <div
        role="separator"
        aria-orientation="vertical"
        className={`wb-separator wb-separator-vertical ${className}`}
        style={{
          width: '1px',
          height: '100%',
          minHeight: '1rem',
          backgroundColor: 'var(--wb-color-border)',
          alignSelf: 'stretch',
          ...style,
        }}
        {...props}
      />
    );
  }

  if (label) {
    return (
      <div
        role="separator"
        aria-orientation="horizontal"
        className={`wb-separator-labeled ${className}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          width: '100%',
          margin: '0.5rem 0',
          ...style,
        }}
        {...props}
      >
        <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--wb-color-border)' }} />
        <span
          style={{
            fontSize: 'var(--wb-text-xs)',
            color: 'var(--wb-color-fg-subtle)',
            textTransform: 'uppercase',
            letterSpacing: 'var(--wb-tracking-wide)',
            userSelect: 'none',
          }}
        >
          {label}
        </span>
        <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--wb-color-border)' }} />
      </div>
    );
  }

  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      className={`wb-separator wb-separator-horizontal ${className}`}
      style={{
        height: '1px',
        width: '100%',
        backgroundColor: 'var(--wb-color-border)',
        margin: '0.5rem 0',
        ...style,
      }}
      {...props}
    />
  );
};
