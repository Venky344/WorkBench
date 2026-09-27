import { forwardRef, SelectHTMLAttributes, useId } from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  helperText?: string;
  errorMessage?: string;
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      options,
      helperText,
      errorMessage,
      placeholder,
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

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
          <select
            ref={ref}
            id={id}
            disabled={disabled}
            required={required}
            aria-invalid={hasError}
            aria-describedby={hasError ? `${id}-error` : helperText ? `${id}-helper` : undefined}
            className={`wb-select ${hasError ? 'wb-select-error' : ''} ${className}`}
            style={{
              width: '100%',
              height: '2.25rem',
              paddingLeft: '0.75rem',
              paddingRight: '2rem',
              backgroundColor: 'var(--wb-color-bg-subtle)',
              color: 'var(--wb-color-fg)',
              border: `1px solid ${hasError ? 'var(--wb-color-destructive)' : 'var(--wb-color-border)'}`,
              borderRadius: 'var(--wb-radius-md)',
              fontSize: 'var(--wb-text-sm)',
              outline: 'none',
              appearance: 'none',
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.6 : 1,
              transition: 'var(--wb-transition-colors)',
              ...style,
            }}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>

          <ChevronDown
            size={16}
            style={{
              position: 'absolute',
              right: '0.75rem',
              color: 'var(--wb-color-fg-subtle)',
              pointerEvents: 'none',
            }}
          />
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

Select.displayName = 'Select';
