import React from 'react';
import { useToastStore, ToastItem } from '@/stores/toast.store';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 'var(--wb-z-toast)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        maxWidth: '380px',
        width: '100%',
        pointerEvents: 'none',
      }}
    >
      {toasts.map((t) => (
        <ToastCard key={t.id} toast={t} onClose={() => removeToast(t.id)} />
      ))}
    </div>
  );
};

const ToastCard: React.FC<{ toast: ToastItem; onClose: () => void }> = ({ toast, onClose }) => {
  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 size={18} color="var(--wb-color-success)" />;
      case 'warning':
        return <AlertTriangle size={18} color="var(--wb-color-warning)" />;
      case 'error':
        return <AlertCircle size={18} color="var(--wb-color-destructive)" />;
      case 'info':
      default:
        return <Info size={18} color="var(--wb-color-primary)" />;
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case 'success':
        return 'var(--wb-color-success)';
      case 'warning':
        return 'var(--wb-color-warning)';
      case 'error':
        return 'var(--wb-color-destructive)';
      case 'info':
      default:
        return 'var(--wb-color-primary)';
    }
  };

  return (
    <div
      role="status"
      style={{
        pointerEvents: 'auto',
        backgroundColor: 'var(--wb-color-surface-elevated)',
        border: '1px solid var(--wb-color-border)',
        borderLeft: `4px solid ${getBorderColor()}`,
        borderRadius: 'var(--wb-radius-lg)',
        boxShadow: 'var(--wb-shadow-lg)',
        padding: '0.875rem 1rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        animation: 'wb-slide-up var(--wb-duration-fast) var(--wb-ease-out)',
      }}
    >
      <div style={{ marginTop: '0.125rem' }}>{getIcon()}</div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {toast.title && (
          <span
            style={{
              fontSize: 'var(--wb-text-sm)',
              fontWeight: 'var(--wb-weight-semibold)',
              color: 'var(--wb-color-fg)',
            }}
          >
            {toast.title}
          </span>
        )}
        <span
          style={{
            fontSize: 'var(--wb-text-xs)',
            color: 'var(--wb-color-fg-muted)',
            lineHeight: 'var(--wb-leading-normal)',
          }}
        >
          {toast.message}
        </span>
      </div>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--wb-color-fg-subtle)',
          cursor: 'pointer',
          padding: '0.125rem',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
};
