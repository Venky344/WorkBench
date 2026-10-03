import React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import {
  LayoutDashboard,
  Network,
  MessageSquare,
  FileText,
  StickyNote,
  CheckSquare,
  GitCommit,
  BookMarked,
  Activity,
  Settings,
} from 'lucide-react';

export interface ProjectNavTab {
  readonly id: string;
  readonly label: string;
  readonly path: string;
  readonly icon: React.ReactNode;
  readonly end?: boolean;
}

export const ProjectNavigation: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();

  if (!projectId) return null;

  const tabs: readonly ProjectNavTab[] = [
    {
      id: 'overview',
      label: 'Overview',
      path: `/projects/${projectId}`,
      icon: <LayoutDashboard size={15} />,
      end: true,
    },
    {
      id: 'brain',
      label: 'Brain',
      path: `/projects/${projectId}/brain`,
      icon: <Network size={15} />,
    },
    {
      id: 'chats',
      label: 'Chats',
      path: `/projects/${projectId}/chats`,
      icon: <MessageSquare size={15} />,
    },
    {
      id: 'files',
      label: 'Files',
      path: `/projects/${projectId}/files`,
      icon: <FileText size={15} />,
    },
    {
      id: 'notes',
      label: 'Notes',
      path: `/projects/${projectId}/notes`,
      icon: <StickyNote size={15} />,
    },
    {
      id: 'tasks',
      label: 'Tasks',
      path: `/projects/${projectId}/tasks`,
      icon: <CheckSquare size={15} />,
    },
    {
      id: 'decisions',
      label: 'Decisions',
      path: `/projects/${projectId}/decisions`,
      icon: <GitCommit size={15} />,
    },
    {
      id: 'resources',
      label: 'Resources',
      path: `/projects/${projectId}/resources`,
      icon: <BookMarked size={15} />,
    },
    {
      id: 'activity',
      label: 'Activity',
      path: `/projects/${projectId}/activity`,
      icon: <Activity size={15} />,
    },
    {
      id: 'settings',
      label: 'Settings',
      path: `/projects/${projectId}/settings`,
      icon: <Settings size={15} />,
    },
  ];

  return (
    <nav
      aria-label="Project Workspace Navigation"
      style={{
        display: 'flex',
        borderBottom: '1px solid var(--wb-color-border-subtle)',
        overflowX: 'auto',
        scrollbarWidth: 'none',
        gap: '0.25rem',
      }}
    >
      <div
        role="tablist"
        style={{
          display: 'flex',
          gap: '0.25rem',
          minWidth: 'max-content',
          paddingBottom: '2px',
        }}
      >
        {tabs.map((tab) => (
          <NavLink
            key={tab.id}
            to={tab.path}
            end={tab.end}
            role="tab"
            style={({ isActive }) => ({
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.625rem 0.875rem',
              fontSize: 'var(--wb-text-sm)',
              fontWeight: isActive ? 'var(--wb-weight-semibold)' : 'var(--wb-weight-medium)',
              color: isActive ? 'var(--wb-color-primary)' : 'var(--wb-color-fg-muted)',
              textDecoration: 'none',
              borderBottom: isActive
                ? '2px solid var(--wb-color-primary)'
                : '2px solid transparent',
              borderRadius: 'var(--wb-radius-sm) var(--wb-radius-sm) 0 0',
              transition: 'var(--wb-transition-colors)',
              whiteSpace: 'nowrap',
              backgroundColor: isActive ? 'var(--wb-color-bg-subtle)' : 'transparent',
            })}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
