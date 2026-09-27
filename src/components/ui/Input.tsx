import { forwardRef, InputHTMLAttributes, ReactNode, useId } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      errorMessage,
      leftIcon,
      rightIcon,
      disabled,
      required,
      id: customId,
      className = '',
      style,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const id = customId || generatedId;
    const hasError = Boolean(errorMessage);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', width: '100%' }}>
        {label && (
          <label
            htmlFor={id}
            style={{
              fontSize: 'var(--wb-text-xs)',
              fontWeight: 'var(--wb-weight-medium)',
              color: hasError ? 'var(--wb-color-destructive)' : 'var(--wb-color-fg)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            {label}
            {required && <span style={{ color: 'var(--wb-color-destructive)' }}>*</span>}
          </label>
        )}

        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            width: '100%',
          }}
        >
          {leftIcon && (
            <span
              style={{
                position: 'absolute',
                left: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                color: 'var(--wb-color-fg-subtle)',
                pointerEvents: 'none',
              }}
            >
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={id}
            disabled={disabled}
            required={required}
            aria-invalid={hasError}
            aria-describedby={hasError ? `${id}-error` : helperText ? `${id}-helper` : undefined}
            className={`wb-input ${hasError ? 'wb-input-error' : ''} ${className}`}
            style={{
              width: '100%',
              height: '2.25rem',
              paddingLeft: leftIcon ? '2.25rem' : '0.75rem',
              paddingRight: rightIcon ? '2.25rem' : '0.75rem',
              backgroundColor: 'var(--wb-color-bg-subtle)',
              color: 'var(--wb-color-fg)',
              border: `1px solid ${hasError ? 'var(--wb-color-destructive)' : 'var(--wb-color-border)'}`,
              borderRadius: 'var(--wb-radius-md)',
              fontSize: 'var(--wb-text-sm)',
              outline: 'none',
              transition: 'var(--wb-transition-colors)',
              cursor: disabled ? 'not-allowed' : 'text',
              opacity: disabled ? 0.6 : 1,
              ...style,
            }}
            {...props}
          />

          {rightIcon && (
            <span
              style={{
                position: 'absolute',
                right: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                color: 'var(--wb-color-fg-subtle)',
              }}
            >
              {rightIcon}
            </span>
          )}
        </div>

        {errorMessage ? (
          <span
            id={`${id}-error`}
            role="alert"
            style={{
              fontSize: 'var(--wb-text-xs)',
              color: 'var(--wb-color-destructive)',
            }}
          >
            {errorMessage}
          </span>
        ) : helperText ? (
          <span
            id={`${id}-helper`}
            style={{
              fontSize: 'var(--wb-text-xs)',
              color: 'var(--wb-color-fg-subtle)',
            }}
          >
            {helperText}
          </span>
        ) : null}
      </div>
    );
  },
);

Input.displayName = 'Input';
