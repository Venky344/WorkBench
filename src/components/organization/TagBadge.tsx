import React from 'react';
import { Tag } from '@/domain/entities';
import { getTagColorStyles } from './tag-theme';
import { X, Tag as TagIcon } from 'lucide-react';

export interface TagBadgeProps {
  readonly tag: Tag | string;
  readonly color?: string;
  readonly size?: 'sm' | 'md';
  readonly onRemove?: () => void;
  readonly onClick?: () => void;
  readonly isSelected?: boolean;
  readonly interactive?: boolean;
  readonly showIcon?: boolean;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export const TagBadge: React.FC<TagBadgeProps> = ({
  tag,
  color: explicitColor,
  size = 'md',
  onRemove,
  onClick,
  isSelected = false,
  interactive = false,
  showIcon = false,
  className = '',
  style,
}) => {
  const tagName = typeof tag === 'string' ? tag : tag.name;
  const tagColor = explicitColor ?? (typeof tag === 'object' ? tag.color : 'blue');
  const styles = getTagColorStyles(tagColor);

  const isClickable = !!onClick || interactive;
  const isSm = size === 'sm';

  return (
    <span
      className={`wb-tag-badge ${className}`}
      onClick={isClickable ? onClick : undefined}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: isSm ? '0.25rem' : '0.375rem',
        padding: isSm ? '0.125rem 0.375rem' : '0.2rem 0.5rem',
        borderRadius: 'var(--wb-radius-full)',
        fontSize: isSm ? '11px' : 'var(--wb-text-xs)',
        fontWeight: 'var(--wb-weight-medium)',
        lineHeight: 1.25,
        backgroundColor: isSelected ? styles.color : styles.backgroundColor,
        color: isSelected ? '#ffffff' : styles.color,
        border: `1px solid ${isSelected ? styles.color : styles.borderColor}`,
        cursor: isClickable ? 'pointer' : 'default',
        userSelect: 'none',
        whiteSpace: 'nowrap',
        transition: 'all var(--wb-duration-fast) var(--wb-ease-default)',
        outline: 'none',
        boxShadow: isSelected ? '0 0 0 2px var(--wb-color-bg), 0 0 0 4px ' + styles.color : 'none',
        ...style,
      }}
      aria-label={`Tag: ${tagName}`}
    >
      {showIcon && <TagIcon size={isSm ? 10 : 12} />}
      <span>#{tagName.replace(/^#/, '')}</span>

      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          aria-label={`Remove tag ${tagName}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'none',
            border: 'none',
            padding: 0,
            marginLeft: '0.125rem',
            color: 'inherit',
            cursor: 'pointer',
            opacity: 0.75,
            borderRadius: 'var(--wb-radius-full)',
            transition: 'opacity var(--wb-duration-fast)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.75')}
        >
          <X size={isSm ? 11 : 13} />
        </button>
      )}
    </span>
  );
};
