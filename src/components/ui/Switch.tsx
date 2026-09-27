import { forwardRef, useId } from 'react';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
}

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  (
    { checked, onChange, label, description, disabled = false, id: customId, className = '' },
    ref,
  ) => {
    const generatedId = useId();
    const id = customId || generatedId;

    const handleToggle = () => {
      if (!disabled) {
        onChange(!checked);
      }
    };

    return (
      <div style={{ display: 'inline-flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <button
          ref={ref}
          id={id}
          type="button"
          role="switch"
          aria-checked={checked}
          disabled={disabled}
          onClick={handleToggle}
          className={`wb-switch ${className}`}
          style={{
            position: 'relative',
            width: '2.5rem',
            height: '1.375rem',
            borderRadius: 'var(--wb-radius-full)',
            backgroundColor: checked ? 'var(--wb-color-primary)' : 'var(--wb-color-surface-active)',
            border: `1px solid ${
              checked ? 'var(--wb-color-primary)' : 'var(--wb-color-border-strong)'
            }`,
            padding: '2px',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.6 : 1,
            transition: 'var(--wb-transition-colors)',
            outline: 'none',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              width: '1rem',
              height: '1rem',
              borderRadius: 'var(--wb-radius-full)',
              backgroundColor: checked ? 'var(--wb-color-primary-fg)' : 'var(--wb-color-fg-muted)',
              transform: checked ? 'translateX(1.125rem)' : 'translateX(0)',
              transition: 'var(--wb-transition-transform)',
              boxShadow: 'var(--wb-shadow-sm)',
              display: 'block',
            }}
          />
        </button>

        {(label || description) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
            {label && (
              <label
                htmlFor={id}
                onClick={handleToggle}
                style={{
                  fontSize: 'var(--wb-text-sm)',
                  fontWeight: 'var(--wb-weight-medium)',
                  color: 'var(--wb-color-fg)',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                }}
              >
                {label}
              </label>
            )}
            {description && (
              <span
                style={{
                  fontSize: 'var(--wb-text-xs)',
                  color: 'var(--wb-color-fg-subtle)',
                }}
              >
                {description}
              </span>
            )}
          </div>
        )}
      </div>
    );
  },
);

Switch.displayName = 'Switch';
