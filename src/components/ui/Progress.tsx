import React, { HTMLAttributes } from 'react';

export type ProgressVariant = 'primary' | 'success' | 'warning' | 'destructive';

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100 (or up to max)
  max?: number;
  variant?: ProgressVariant;
  showLabel?: boolean;
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  variant = 'primary',
  showLabel = false,
  className = '',
  style,
  ...props
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const getVariantColor = (): string => {
    switch (variant) {
      case 'success':
        return 'var(--wb-color-success)';
      case 'warning':
        return 'var(--wb-color-warning)';
      case 'destructive':
        return 'var(--wb-color-destructive)';
      case 'primary':
      default:
        return 'var(--wb-color-primary)';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', width: '100%' }}>
      {showLabel && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 'var(--wb-text-xs)',
            color: 'var(--wb-color-fg-muted)',
          }}
        >
          <span>Progress</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}

      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        className={`wb-progress ${className}`}
        style={{
          width: '100%',
          height: '0.5rem',
          backgroundColor: 'var(--wb-color-surface-active)',
          borderRadius: 'var(--wb-radius-full)',
          overflow: 'hidden',
          ...style,
        }}
        {...props}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: '100%',
            backgroundColor: getVariantColor(),
            borderRadius: 'var(--wb-radius-full)',
            transition: 'width var(--wb-duration-normal) var(--wb-ease-out)',
          }}
        />
      </div>
    </div>
  );
};
