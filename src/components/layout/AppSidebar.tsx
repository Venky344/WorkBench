import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Logo, Badge, Tooltip, Separator } from '@/components/ui';
import { useAppStore } from '@/stores/app.store';
import {
  Home,
  FolderKanban,
  MessageSquareQuote,
  Inbox,
  CheckSquare,
  GitCommit,
  BookMarked,
  Settings,
  Palette,
  Star,
  Clock,
} from 'lucide-react';

interface NavItemConfig {
  to: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  badgeVariant?: 'neutral' | 'primary' | 'success' | 'warning' | 'destructive' | 'info';
  shortcut?: string;
}

const PRIMARY_NAV_ITEMS: NavItemConfig[] = [
  { to: '/', label: 'Home', icon: <Home size={18} /> },
  {
    to: '/projects',
    label: 'Projects',
    icon: <FolderKanban size={18} />,
  },
  {
    to: '/chats',
    label: 'Conversations',
    icon: <MessageSquareQuote size={18} />,
  },
  { to: '/inbox', label: 'Inbox', icon: <Inbox size={18} /> },
  {
    to: '/tasks',
    label: 'Tasks',
    icon: <CheckSquare size={18} />,
  },
  { to: '/decisions', label: 'Decisions', icon: <GitCommit size={18} /> },
  { to: '/resources', label: 'Resources', icon: <BookMarked size={18} /> },
];

const SECONDARY_NAV_ITEMS: NavItemConfig[] = [
  { to: '/settings', label: 'Settings', icon: <Settings size={18} /> },
  {
    to: '/showcase',
    label: 'Design System',
    icon: <Palette size={18} />,
    badge: 'Dev',
    badgeVariant: 'primary',
  },
];

export const AppSidebar: React.FC = () => {
  const { isSidebarCollapsed } = useAppStore();
  const location = useLocation();

  const isNavActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const renderNavLink = (item: NavItemConfig) => {
    const active = isNavActive(item.to);

    const linkContent = (
      <NavLink
        to={item.to}
        aria-label={item.label}
        aria-current={active ? 'page' : undefined}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
          gap: '0.75rem',
          padding: isSidebarCollapsed ? '0.625rem 0' : '0.5rem 0.75rem',
          borderRadius: 'var(--wb-radius-md)',
          textDecoration: 'none',
          color: active ? 'var(--wb-color-primary)' : 'var(--wb-color-fg-muted)',
          backgroundColor: active ? 'var(--wb-color-surface-active)' : 'transparent',
          fontWeight: active ? 'var(--wb-weight-semibold)' : 'var(--wb-weight-medium)',
          fontSize: 'var(--wb-text-sm)',
          transition: 'var(--wb-transition-colors)',
          position: 'relative',
        }}
        onMouseEnter={(e) => {
          if (!active) {
            e.currentTarget.style.backgroundColor = 'var(--wb-color-surface-hover)';
            e.currentTarget.style.color = 'var(--wb-color-fg)';
          }
        }}
        onMouseLeave={(e) => {
          if (!active) {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--wb-color-fg-muted)';
          }
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              color: active ? 'var(--wb-color-primary)' : 'inherit',
            }}
          >
            {item.icon}
          </span>
          {!isSidebarCollapsed && <span>{item.label}</span>}
        </div>

        {!isSidebarCollapsed && item.badge && (
          <Badge variant={item.badgeVariant || 'neutral'} badgeStyle="subtle">
            {item.badge}
          </Badge>
        )}

        {/* Active Left Indicator */}
        {active && (
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: '15%',
              bottom: '15%',
              width: '3px',
              backgroundColor: 'var(--wb-color-primary)',
              borderRadius: '0 var(--wb-radius-sm) var(--wb-radius-sm) 0',
            }}
          />
        )}
      </NavLink>
    );

    if (isSidebarCollapsed) {
      return (
        <Tooltip key={item.to} content={item.label} placement="right">
          {linkContent}
        </Tooltip>
      );
    }

    return <React.Fragment key={item.to}>{linkContent}</React.Fragment>;
  };

  return (
    <aside
      className="wb-app-sidebar"
      aria-label="Sidebar Navigation"
      style={{
        width: isSidebarCollapsed ? '4rem' : '16rem',
        minWidth: isSidebarCollapsed ? '4rem' : '16rem',
        backgroundColor: 'var(--wb-color-bg-subtle)',
        borderRight: '1px solid var(--wb-color-border)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        transition: 'width var(--wb-duration-normal) var(--wb-ease-default)',
        userSelect: 'none',
        zIndex: 'var(--wb-z-sticky)',
        overflowX: 'hidden',
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
          height: '3.5rem',
          padding: isSidebarCollapsed ? '0' : '0 1rem',
          borderBottom: '1px solid var(--wb-color-border)',
          flexShrink: 0,
        }}
      >
        <Logo size={isSidebarCollapsed ? 28 : 'md'} showText={!isSidebarCollapsed} />
      </div>

      {/* Main Navigation List */}
      <div
        style={{
          flex: 1,
          padding: '0.75rem 0.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {PRIMARY_NAV_ITEMS.map(renderNavLink)}

        {/* Favorites Section */}
        {!isSidebarCollapsed && (
          <div
            style={{
              marginTop: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0 0.5rem',
                fontSize: 'var(--wb-text-xs)',
                fontWeight: 'var(--wb-weight-semibold)',
                color: 'var(--wb-color-fg-subtle)',
                textTransform: 'uppercase',
                letterSpacing: 'var(--wb-tracking-wide)',
              }}
            >
              <Star size={12} />
              <span>Pinned Projects</span>
            </div>

            <span
              style={{
                padding: '0.375rem 0.5rem',
                fontSize: 'var(--wb-text-xs)',
                color: 'var(--wb-color-fg-subtle)',
                fontStyle: 'italic',
              }}
            >
              Pin projects to access them here
            </span>
          </div>
        )}

        {/* Recent Section */}
        {!isSidebarCollapsed && (
          <div
            style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0 0.5rem',
                fontSize: 'var(--wb-text-xs)',
                fontWeight: 'var(--wb-weight-semibold)',
                color: 'var(--wb-color-fg-subtle)',
                textTransform: 'uppercase',
                letterSpacing: 'var(--wb-tracking-wide)',
              }}
            >
              <Clock size={12} />
              <span>Recent Activity</span>
            </div>

            <span
              style={{
                padding: '0.375rem 0.5rem',
                fontSize: 'var(--wb-text-xs)',
                color: 'var(--wb-color-fg-subtle)',
                fontStyle: 'italic',
              }}
            >
              No recent activity
            </span>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div
        style={{
          padding: '0.5rem',
          borderTop: '1px solid var(--wb-color-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
          flexShrink: 0,
        }}
      >
        <Separator style={{ margin: '0 0 0.5rem 0' }} />
        {SECONDARY_NAV_ITEMS.map(renderNavLink)}
      </div>
    </aside>
  );
};
