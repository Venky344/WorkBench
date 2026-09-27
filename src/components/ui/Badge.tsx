import React, { HTMLAttributes } from 'react';

export type BadgeVariant = 'neutral' | 'primary' | 'success' | 'warning' | 'destructive' | 'info';
export type BadgeStyle = 'subtle' | 'solid' | 'outline';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  badgeStyle?: BadgeStyle;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  badgeStyle = 'subtle',
  dot = false,
  className = '',
  style,
  ...props
}) => {
  const getColors = (): { bg: string; fg: string; border: string; dot: string } => {
    switch (variant) {
      case 'primary':
        return {
          bg: badgeStyle === 'solid' ? 'var(--wb-color-primary)' : 'rgba(56, 189, 248, 0.15)',
          fg: badgeStyle === 'solid' ? 'var(--wb-color-primary-fg)' : 'var(--wb-color-primary)',
          border: badgeStyle === 'outline' ? 'var(--wb-color-primary)' : 'transparent',
          dot: 'var(--wb-color-primary)',
        };
      case 'success':
        return {
          bg: badgeStyle === 'solid' ? 'var(--wb-color-success)' : 'var(--wb-color-success-subtle)',
          fg: badgeStyle === 'solid' ? 'var(--wb-color-success-fg)' : 'var(--wb-color-success)',
          border: badgeStyle === 'outline' ? 'var(--wb-color-success)' : 'transparent',
          dot: 'var(--wb-color-success)',
        };
      case 'warning':
        return {
          bg: badgeStyle === 'solid' ? 'var(--wb-color-warning)' : 'var(--wb-color-warning-subtle)',
          fg: badgeStyle === 'solid' ? 'var(--wb-color-warning-fg)' : 'var(--wb-color-warning)',
          border: badgeStyle === 'outline' ? 'var(--wb-color-warning)' : 'transparent',
          dot: 'var(--wb-color-warning)',
        };
      case 'destructive':
        return {
          bg:
            badgeStyle === 'solid'
              ? 'var(--wb-color-destructive)'
              : 'var(--wb-color-destructive-subtle)',
          fg:
            badgeStyle === 'solid'
              ? 'var(--wb-color-destructive-fg)'
              : 'var(--wb-color-destructive)',
          border: badgeStyle === 'outline' ? 'var(--wb-color-destructive)' : 'transparent',
          dot: 'var(--wb-color-destructive)',
        };
      case 'info':
        return {
          bg: badgeStyle === 'solid' ? 'var(--wb-color-info)' : 'var(--wb-color-info-subtle)',
          fg: badgeStyle === 'solid' ? 'var(--wb-color-info-fg)' : 'var(--wb-color-info)',
          border: badgeStyle === 'outline' ? 'var(--wb-color-info)' : 'transparent',
          dot: 'var(--wb-color-info)',
        };
      case 'neutral':
      default:
        return {
          bg:
            badgeStyle === 'solid' ? 'var(--wb-color-secondary)' : 'var(--wb-color-surface-active)',
          fg: 'var(--wb-color-fg-muted)',
          border: badgeStyle === 'outline' ? 'var(--wb-color-border-strong)' : 'transparent',
          dot: 'var(--wb-color-fg-subtle)',
        };
    }
  };

  const colors = getColors();

  return (
    <span
      className={`wb-badge wb-badge-${variant} ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.375rem',
        padding: '0.125rem 0.5rem',
        borderRadius: 'var(--wb-radius-full)',
        fontSize: 'var(--wb-text-xs)',
        fontWeight: 'var(--wb-weight-medium)',
        lineHeight: '1.25',
        backgroundColor: badgeStyle === 'outline' ? 'transparent' : colors.bg,
        color: colors.fg,
        border: `1px solid ${badgeStyle === 'outline' ? colors.border : 'transparent'}`,
        userSelect: 'none',
        whiteSpace: 'nowrap',
        ...style,
      }}
      {...props}
    >
      {dot && (
        <span
          style={{
            width: '0.375rem',
            height: '0.375rem',
            borderRadius: 'var(--wb-radius-full)',
            backgroundColor: colors.dot,
            display: 'inline-block',
          }}
        />
      )}
      {children}
    </span>
  );
};
