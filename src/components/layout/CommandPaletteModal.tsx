import React, { useEffect } from 'react';
import { Dialog, DialogFooter, Button, Badge } from '@/components/ui';
import { useAppStore } from '@/stores/app.store';
import { Command, Terminal } from 'lucide-react';

export const CommandPaletteModal: React.FC = () => {
  const { isCommandPaletteOpen, setCommandPaletteOpen } = useAppStore();

  // Global keyboard listener for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
      }
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setCommandPaletteOpen]);

  return (
    <Dialog
      isOpen={isCommandPaletteOpen}
      onClose={() => setCommandPaletteOpen(false)}
      title="Command Center"
      description="Shell-level command palette integration foundation."
    >
      <div
        style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '0.5rem 0' }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1rem',
            backgroundColor: 'var(--wb-color-bg-subtle)',
            border: '1px solid var(--wb-color-border)',
            borderRadius: 'var(--wb-radius-md)',
          }}
        >
          <Terminal size={24} color="var(--wb-color-primary)" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span
              style={{
                fontSize: 'var(--wb-text-sm)',
                fontWeight: 'var(--wb-weight-semibold)',
                color: 'var(--wb-color-fg)',
              }}
            >
              Command Center will be available in Phase 19.
            </span>
            <span style={{ fontSize: 'var(--wb-text-xs)', color: 'var(--wb-color-fg-muted)' }}>
              The application shell provides the global{' '}
              <kbd
                style={{
                  padding: '0.125rem 0.375rem',
                  backgroundColor: 'var(--wb-color-surface-elevated)',
                  border: '1px solid var(--wb-color-border)',
                  borderRadius: 'var(--wb-radius-xs)',
                  fontSize: '11px',
                  fontFamily: 'var(--wb-font-mono)',
                }}
              >
                Ctrl+K
              </kbd>{' '}
              trigger foundation ready for future command registry and execution engines.
            </span>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 0.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Badge variant="primary" dot>
              Phase 3 Shell Foundation
            </Badge>
            <Badge variant="neutral">Phase 19 Target</Badge>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="primary"
            leftIcon={<Command size={14} />}
            onClick={() => setCommandPaletteOpen(false)}
          >
            Got it
          </Button>
        </DialogFooter>
      </div>
    </Dialog>
  );
};
