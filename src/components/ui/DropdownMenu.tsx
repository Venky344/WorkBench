import React, { useState, useRef, useEffect, ReactNode, HTMLAttributes } from 'react';

export interface DropdownMenuProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  trigger,
  children,
  align = 'left',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div
      ref={containerRef}
      className={`wb-dropdown ${className}`}
      style={{ position: 'relative', display: 'inline-block' }}
    >
      <div
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        style={{ cursor: 'pointer' }}
      >
        {trigger}
      </div>

      {isOpen && (
        <div
          role="menu"
          className="wb-dropdown-content"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            [align === 'right' ? 'right' : 'left']: 0,
            zIndex: 'var(--wb-z-dropdown)',
            minWidth: '180px',
            backgroundColor: 'var(--wb-color-surface-elevated)',
            border: '1px solid var(--wb-color-border)',
            borderRadius: 'var(--wb-radius-lg)',
            boxShadow: 'var(--wb-shadow-lg)',
            padding: '0.375rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.125rem',
            animation: 'wb-fade-in var(--wb-duration-fast) var(--wb-ease-out)',
          }}
          onClick={() => setIsOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export interface DropdownMenuItemProps extends HTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode;
  destructive?: boolean;
  disabled?: boolean;
}

export const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({
  children,
  icon,
  destructive = false,
  disabled = false,
  className = '',
  style,
  ...props
}) => {
  return (
    <button
      role="menuitem"
      disabled={disabled}
      className={`wb-dropdown-item ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        width: '100%',
        padding: '0.375rem 0.625rem',
        fontSize: 'var(--wb-text-sm)',
        color: destructive ? 'var(--wb-color-destructive)' : 'var(--wb-color-fg)',
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: 'var(--wb-radius-md)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        textAlign: 'left',
        opacity: disabled ? 0.5 : 1,
        transition: 'var(--wb-transition-colors)',
        ...style,
      }}
      {...props}
    >
      {icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
      <span style={{ flex: 1 }}>{children}</span>
    </button>
  );
};

export const DropdownMenuSeparator: React.FC = () => (
  <div
    role="separator"
    style={{
      height: '1px',
      backgroundColor: 'var(--wb-color-border)',
      margin: '0.25rem 0',
    }}
  />
);
