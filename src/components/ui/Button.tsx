import React, { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      className = '',
      style,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || isLoading;

    // Variant style maps
    const getVariantStyles = (): React.CSSProperties => {
      switch (variant) {
        case 'primary':
          return {
            backgroundColor: 'var(--wb-color-primary)',
            color: 'var(--wb-color-primary-fg)',
            border: '1px solid transparent',
          };
        case 'secondary':
          return {
            backgroundColor: 'var(--wb-color-secondary)',
            color: 'var(--wb-color-secondary-fg)',
            border: '1px solid var(--wb-color-border)',
          };
        case 'outline':
          return {
            backgroundColor: 'transparent',
            color: 'var(--wb-color-fg)',
            border: '1px solid var(--wb-color-border-strong)',
          };
        case 'ghost':
          return {
            backgroundColor: 'transparent',
            color: 'var(--wb-color-fg-muted)',
            border: '1px solid transparent',
          };
        case 'destructive':
          return {
            backgroundColor: 'var(--wb-color-destructive)',
            color: 'var(--wb-color-destructive-fg)',
            border: '1px solid transparent',
          };
        case 'link':
          return {
            backgroundColor: 'transparent',
            color: 'var(--wb-color-primary)',
            border: 'none',
            padding: 0,
            height: 'auto',
            textDecoration: 'underline',
          };
        default:
          return {};
      }
    };

    const getSizeStyles = (): React.CSSProperties => {
      if (variant === 'link') return {};
      switch (size) {
        case 'sm':
          return {
            height: '2rem',
            padding: '0 0.625rem',
            fontSize: 'var(--wb-text-xs)',
            gap: '0.375rem',
          };
        case 'lg':
          return {
            height: '2.75rem',
            padding: '0 1.25rem',
            fontSize: 'var(--wb-text-base)',
            gap: '0.625rem',
          };
        case 'icon':
          return {
            width: '2.25rem',
            height: '2.25rem',
            padding: 0,
            fontSize: 'var(--wb-text-sm)',
            justifyContent: 'center',
          };
        case 'md':
        default:
          return {
            height: '2.25rem',
            padding: '0 0.875rem',
            fontSize: 'var(--wb-text-sm)',
            gap: '0.5rem',
          };
      }
    };

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-busy={isLoading}
        className={`wb-button wb-button-${variant} wb-button-${size} ${className}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 'var(--wb-radius-md)',
          fontWeight: 'var(--wb-weight-medium)',
          lineHeight: 1,
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          opacity: isDisabled ? 0.6 : 1,
          transition: 'var(--wb-transition-colors)',
          userSelect: 'none',
          whiteSpace: 'nowrap',
          ...getVariantStyles(),
          ...getSizeStyles(),
          ...style,
        }}
        {...props}
      >
        {isLoading && (
          <Loader2
            className="wb-spinner"
            size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16}
            style={{ animation: 'wb-spin 1s linear infinite' }}
          />
        )}
        {!isLoading && leftIcon && <span className="wb-btn-icon-left">{leftIcon}</span>}
        {children && <span>{children}</span>}
        {!isLoading && rightIcon && <span className="wb-btn-icon-right">{rightIcon}</span>}
      </button>
    );
  },
);

Button.displayName = 'Button';
