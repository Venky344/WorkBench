import React, { HTMLAttributes } from 'react';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  circle?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  borderRadius,
  circle = false,
  className = '',
  style,
  ...props
}) => {
  return (
    <div
      className={`wb-skeleton ${className}`}
      aria-hidden="true"
      style={{
        width: circle ? height || width || '2.5rem' : width || '100%',
        height: height || '1.25rem',
        borderRadius: circle ? 'var(--wb-radius-full)' : borderRadius || 'var(--wb-radius-md)',
        backgroundColor: 'var(--wb-color-surface-active)',
        animation: 'wb-pulse 1.5s ease-in-out infinite',
        ...style,
      }}
      {...props}
    />
  );
};
