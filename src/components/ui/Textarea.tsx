import { forwardRef, TextareaHTMLAttributes, useId } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      helperText,
      errorMessage,
      disabled,
      required,
      id: customId,
      className = '',
      style,
      rows = 3,
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

        <textarea
          ref={ref}
          id={id}
          rows={rows}
          disabled={disabled}
          required={required}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${id}-error` : helperText ? `${id}-helper` : undefined}
          className={`wb-textarea ${hasError ? 'wb-textarea-error' : ''} ${className}`}
          style={{
            width: '100%',
            padding: '0.5rem 0.75rem',
            backgroundColor: 'var(--wb-color-bg-subtle)',
            color: 'var(--wb-color-fg)',
            border: `1px solid ${hasError ? 'var(--wb-color-destructive)' : 'var(--wb-color-border)'}`,
            borderRadius: 'var(--wb-radius-md)',
            fontSize: 'var(--wb-text-sm)',
            lineHeight: 'var(--wb-leading-normal)',
            outline: 'none',
            resize: 'vertical',
            transition: 'var(--wb-transition-colors)',
            cursor: disabled ? 'not-allowed' : 'text',
            opacity: disabled ? 0.6 : 1,
            ...style,
          }}
          {...props}
        />

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

Textarea.displayName = 'Textarea';
