import React, { forwardRef, HTMLAttributes } from 'react';

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'interactive';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, variant = 'default', className = '', style, ...props }, ref) => {
    const getVariantStyles = (): React.CSSProperties => {
      switch (variant) {
        case 'elevated':
          return {
            backgroundColor: 'var(--wb-color-surface-elevated)',
            border: '1px solid var(--wb-color-border)',
            boxShadow: 'var(--wb-shadow-md)',
          };
        case 'outlined':
          return {
            backgroundColor: 'transparent',
            border: '1px solid var(--wb-color-border-strong)',
          };
        case 'interactive':
          return {
            backgroundColor: 'var(--wb-color-surface)',
            border: '1px solid var(--wb-color-border)',
            cursor: 'pointer',
            transition: 'var(--wb-transition-all)',
          };
        case 'default':
        default:
          return {
            backgroundColor: 'var(--wb-color-surface)',
            border: '1px solid var(--wb-color-border)',
            boxShadow: 'var(--wb-shadow-sm)',
          };
      }
    };

    return (
      <div
        ref={ref}
        className={`wb-card wb-card-${variant} ${className}`}
        style={{
          borderRadius: 'var(--wb-radius-lg)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          ...getVariantStyles(),
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Card.displayName = 'Card';

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ children, className = '', style, ...props }, ref) => (
    <div
      ref={ref}
      className={`wb-card-header ${className}`}
      style={{
        padding: '1.25rem 1.25rem 0.5rem 1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  ),
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ children, className = '', style, ...props }, ref) => (
    <h3
      ref={ref}
      className={`wb-card-title ${className}`}
      style={{
        fontSize: 'var(--wb-text-lg)',
        fontWeight: 'var(--wb-weight-semibold)',
        color: 'var(--wb-color-fg)',
        margin: 0,
        ...style,
      }}
      {...props}
    >
      {children}
    </h3>
  ),
);
CardTitle.displayName = 'CardTitle';

export const CardDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ children, className = '', style, ...props }, ref) => (
  <p
    ref={ref}
    className={`wb-card-description ${className}`}
    style={{
      fontSize: 'var(--wb-text-sm)',
      color: 'var(--wb-color-fg-muted)',
      margin: 0,
      ...style,
    }}
    {...props}
  >
    {children}
  </p>
));
CardDescription.displayName = 'CardDescription';

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ children, className = '', style, ...props }, ref) => (
    <div
      ref={ref}
      className={`wb-card-content ${className}`}
      style={{
        padding: '1.25rem',
        flex: 1,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  ),
);
CardContent.displayName = 'CardContent';

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ children, className = '', style, ...props }, ref) => (
    <div
      ref={ref}
      className={`wb-card-footer ${className}`}
      style={{
        padding: '0.75rem 1.25rem 1.25rem 1.25rem',
        borderTop: '1px solid var(--wb-color-border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: '0.75rem',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  ),
);
CardFooter.displayName = 'CardFooter';
