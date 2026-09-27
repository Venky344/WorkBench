import { forwardRef, InputHTMLAttributes, useId } from 'react';

export interface RadioItemProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioItemProps>(
  (
    {
      label,
      description,
      checked = false,
      disabled = false,
      id: customId,
      className = '',
      onChange,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const id = customId || generatedId;

    return (
      <label
        htmlFor={id}
        style={{
          display: 'inline-flex',
          alignItems: 'flex-start',
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
            marginTop: '0.125rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <input
            ref={ref}
            type="radio"
            id={id}
            checked={checked}
            disabled={disabled}
            onChange={onChange}
            className={`wb-radio-native ${className}`}
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
            className="wb-radio-indicator"
            style={{
              width: '1.125rem',
              height: '1.125rem',
              borderRadius: 'var(--wb-radius-full)',
              border: `1px solid ${
                checked ? 'var(--wb-color-primary)' : 'var(--wb-color-border-strong)'
              }`,
              backgroundColor: 'var(--wb-color-bg-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'var(--wb-transition-colors)',
            }}
          >
            {checked && (
              <div
                style={{
                  width: '0.5rem',
                  height: '0.5rem',
                  borderRadius: 'var(--wb-radius-full)',
                  backgroundColor: 'var(--wb-color-primary)',
                }}
              />
            )}
          </div>
        </div>

        {(label || description) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
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
      </label>
    );
  },
);

Radio.displayName = 'Radio';
