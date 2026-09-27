import React from 'react';
import { Link } from 'react-router-dom';
import {
  Button,
  Tooltip,
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
  Avatar,
} from '@/components/ui';
import { useAppStore } from '@/stores/app.store';
import { useThemeStore } from '@/stores/theme.store';
import { toast } from '@/stores/toast.store';
import {
  Search,
  Plus,
  Bell,
  Sun,
  Moon,
  Laptop,
  Settings,
  Palette,
  ExternalLink,
} from 'lucide-react';

export const GlobalActions: React.FC = () => {
  const { setCommandPaletteOpen, setQuickCaptureOpen } = useAppStore();
  const { theme, resolvedTheme, setTheme } = useThemeStore();

  const handleNotificationsClick = () => {
    toast.info('No new unread workspace alerts.', 'Workspace Notifications');
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.625rem',
      }}
    >
      {/* Search / Command Palette Trigger */}
      <Tooltip content="Universal Search (Ctrl+K)" placement="bottom">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          aria-label="Universal Search"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.75rem',
            backgroundColor: 'var(--wb-color-bg-subtle)',
            border: '1px solid var(--wb-color-border)',
            borderRadius: 'var(--wb-radius-md)',
            color: 'var(--wb-color-fg-muted)',
            fontSize: 'var(--wb-text-xs)',
            cursor: 'pointer',
            transition: 'var(--wb-transition-colors)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--wb-color-border-strong)';
            e.currentTarget.style.color = 'var(--wb-color-fg)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--wb-color-border)';
            e.currentTarget.style.color = 'var(--wb-color-fg-muted)';
          }}
        >
          <Search size={14} color="var(--wb-color-fg-subtle)" />
          <span style={{ display: 'inline-block' }}>Search...</span>
          <kbd
            style={{
              padding: '0.1rem 0.35rem',
              backgroundColor: 'var(--wb-color-surface-active)',
              border: '1px solid var(--wb-color-border-strong)',
              borderRadius: 'var(--wb-radius-sm)',
              fontSize: '10px',
              fontWeight: 600,
              fontFamily: 'var(--wb-font-mono)',
              color: 'var(--wb-color-fg-subtle)',
            }}
          >
            Ctrl K
          </kbd>
        </button>
      </Tooltip>

      {/* Quick Capture Trigger */}
      <Tooltip content="Quick Capture (Ctrl+Shift+Space)" placement="bottom">
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus size={14} />}
          onClick={() => setQuickCaptureOpen(true)}
        >
          Capture
        </Button>
      </Tooltip>

      {/* Theme Switcher Dropdown */}
      <DropdownMenu
        align="right"
        trigger={
          <Button variant="ghost" size="icon" aria-label="Toggle theme">
            {resolvedTheme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
          </Button>
        }
      >
        <DropdownMenuItem
          icon={<Moon size={14} />}
          onClick={() => setTheme('dark')}
          style={{ fontWeight: theme === 'dark' ? 600 : 400 }}
        >
          Dark Theme {theme === 'dark' && '✓'}
        </DropdownMenuItem>
        <DropdownMenuItem
          icon={<Sun size={14} />}
          onClick={() => setTheme('light')}
          style={{ fontWeight: theme === 'light' ? 600 : 400 }}
        >
          Light Theme {theme === 'light' && '✓'}
        </DropdownMenuItem>
        <DropdownMenuItem
          icon={<Laptop size={14} />}
          onClick={() => setTheme('system')}
          style={{ fontWeight: theme === 'system' ? 600 : 400 }}
        >
          System Default {theme === 'system' && '✓'}
        </DropdownMenuItem>
      </DropdownMenu>

      {/* Notifications Placeholder */}
      <Tooltip content="Workspace Notifications" placement="bottom">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notifications"
          onClick={handleNotificationsClick}
          style={{ position: 'relative' }}
        >
          <Bell size={16} />
          <span
            style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              width: '6px',
              height: '6px',
              borderRadius: 'var(--wb-radius-full)',
              backgroundColor: 'var(--wb-color-primary)',
            }}
          />
        </Button>
      </Tooltip>

      {/* User / Workspace Dropdown Menu */}
      <DropdownMenu
        align="right"
        trigger={
          <button
            aria-label="Workspace profile menu"
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Avatar name="Venky Rao" size="sm" type="user" color="var(--wb-color-primary)" />
          </button>
        }
      >
        <div style={{ padding: '0.5rem 0.75rem', display: 'flex', flexDirection: 'column' }}>
          <span
            style={{
              fontSize: 'var(--wb-text-sm)',
              fontWeight: 'var(--wb-weight-semibold)',
              color: 'var(--wb-color-fg)',
            }}
          >
            Venky Rao
          </span>
          <span style={{ fontSize: 'var(--wb-text-xs)', color: 'var(--wb-color-fg-subtle)' }}>
            Personal Workspace (Local)
          </span>
        </div>
        <DropdownMenuSeparator />
        <Link to="/settings" style={{ textDecoration: 'none' }}>
          <DropdownMenuItem icon={<Settings size={14} />}>Settings</DropdownMenuItem>
        </Link>
        <Link to="/showcase" style={{ textDecoration: 'none' }}>
          <DropdownMenuItem icon={<Palette size={14} />}>Design System</DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          icon={<ExternalLink size={14} />}
          onClick={() => window.open('https://github.com/Venky344/WorkBench', '_blank')}
        >
          GitHub Repository
        </DropdownMenuItem>
      </DropdownMenu>
    </div>
  );
};
