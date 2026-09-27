import { forwardRef, InputHTMLAttributes, useEffect, useRef, useId } from 'react';
import { Check, Minus } from 'lucide-react';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  helperText?: string;
  indeterminate?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      helperText,
      indeterminate = false,
      checked = false,
      disabled = false,
      id: customId,
      className = '',
      onChange,
      ...props
    },
    forwardedRef,
  ) => {
    const generatedId = useId();
    const id = customId || generatedId;
    const internalRef = useRef<HTMLInputElement>(null);

    // Sync indeterminate property on real DOM node
    useEffect(() => {
      const element = (
        forwardedRef && 'current' in forwardedRef ? forwardedRef.current : internalRef.current
      ) as HTMLInputElement | null;
      if (element) {
        element.indeterminate = indeterminate;
      }
    }, [indeterminate, forwardedRef]);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <label
          htmlFor={id}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: disabled ? 'not-allowed' : 'pointer',
            userSelect: 'none',
            opacity: disabled ? 0.6 : 1,
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '1.125rem',
              height: '1.125rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <input
              ref={forwardedRef || internalRef}
              type="checkbox"
              id={id}
              checked={checked}
              disabled={disabled}
              onChange={onChange}
              className={`wb-checkbox-native ${className}`}
              style={{
                position: 'absolute',
                opacity: 0,
                width: '100%',
                height: '100%',
                margin: 0,
                cursor: disabled ? 'not-allowed' : 'pointer',
              }}
              {...props}
            />
            <div
              className="wb-checkbox-indicator"
              style={{
                width: '1.125rem',
                height: '1.125rem',
                borderRadius: 'var(--wb-radius-sm)',
                border: `1px solid ${
                  checked || indeterminate
                    ? 'var(--wb-color-primary)'
                    : 'var(--wb-color-border-strong)'
                }`,
                backgroundColor:
                  checked || indeterminate
                    ? 'var(--wb-color-primary)'
                    : 'var(--wb-color-bg-subtle)',
                color: 'var(--wb-color-primary-fg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'var(--wb-transition-colors)',
              }}
            >
              {indeterminate ? (
                <Minus size={12} strokeWidth={3} />
              ) : checked ? (
                <Check size={12} strokeWidth={3} />
              ) : null}
            </div>
          </div>

          {label && (
            <span
              style={{
                fontSize: 'var(--wb-text-sm)',
                color: 'var(--wb-color-fg)',
                fontWeight: 'var(--wb-weight-normal)',
              }}
            >
              {label}
            </span>
          )}
        </label>

        {helperText && (
          <span
            style={{
              paddingLeft: '1.625rem',
              fontSize: 'var(--wb-text-xs)',
              color: 'var(--wb-color-fg-subtle)',
            }}
          >
            {helperText}
          </span>
        )}
      </div>
    );
  },
);

Checkbox.displayName = 'Checkbox';
