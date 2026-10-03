import React, { useEffect, useRef, ReactNode, forwardRef, HTMLAttributes } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: ReactNode;
  description?: string;
  maxWidth?: string | number;
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  children,
  title,
  description,
  maxWidth = '520px',
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'dialog-title' : undefined}
      aria-describedby={description ? 'dialog-description' : undefined}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 'var(--wb-z-modal)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      {/* Backdrop */}
      <div
        data-testid="dialog-backdrop"
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)',
          zIndex: 'var(--wb-z-modal-backdrop)',
          animation: 'wb-fade-in var(--wb-duration-fast) var(--wb-ease-out)',
        }}
      />

      {/* Dialog Modal Container */}
      <div
        ref={dialogRef}
        className="wb-dialog-container"
        style={{
          position: 'relative',
          zIndex: 'var(--wb-z-modal)',
          maxWidth,
          width: '100%',
          backgroundColor: 'var(--wb-color-surface-elevated)',
          border: '1px solid var(--wb-color-border)',
          borderRadius: 'var(--wb-radius-xl)',
          boxShadow: 'var(--wb-shadow-elevated)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'wb-zoom-in var(--wb-duration-fast) var(--wb-ease-out)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--wb-color-border-subtle)',
          }}
        >
          <div>
            {title && (
              <h2
                id="dialog-title"
                style={{
                  margin: 0,
                  fontSize: 'var(--wb-text-lg)',
                  fontWeight: 'var(--wb-weight-semibold)',
                  color: 'var(--wb-color-fg)',
                }}
              >
                {title}
              </h2>
            )}
            {description && (
              <p
                id="dialog-description"
                style={{
                  margin: '0.25rem 0 0 0',
                  fontSize: 'var(--wb-text-sm)',
                  color: 'var(--wb-color-fg-muted)',
                }}
              >
                {description}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close dialog"
            style={{ marginTop: '-0.25rem', marginRight: '-0.5rem' }}
          >
            <X size={18} />
          </Button>
        </div>

        <div style={{ padding: '1.5rem', overflowY: 'auto', maxHeight: '75vh' }}>{children}</div>
      </div>
    </div>
  );
};

export const DialogFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ children, className = '', style, ...props }, ref) => (
    <div
      ref={ref}
      className={`wb-dialog-footer ${className}`}
      style={{
        marginTop: '1.5rem',
        paddingTop: '1rem',
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
DialogFooter.displayName = 'DialogFooter';
