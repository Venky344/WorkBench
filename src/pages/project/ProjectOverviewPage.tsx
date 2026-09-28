import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { ProjectWorkspaceContextValue } from '@/components/project/ProjectWorkspace';
import { ProjectContextPanel } from '@/components/project/ProjectContextPanel';
import { ProjectModuleCard } from '@/components/project/ProjectModuleCard';
import { Card, CardHeader, CardTitle, CardContent, Separator } from '@/components/ui';
import {
  Calendar,
  Clock,
  Archive,
  MessageSquare,
  FileText,
  StickyNote,
  CheckSquare,
  GitCommit,
  BookMarked,
  Activity,
  FolderGit2,
} from 'lucide-react';

export const ProjectOverviewPage: React.FC = () => {
  const { project, onProjectUpdated } = useOutletContext<ProjectWorkspaceContextValue>();

  const modules = [
    {
      title: 'Conversations & Chats',
      description: 'Project conversations, chat groups, and chat history.',
      icon: <MessageSquare size={18} />,
      to: `/projects/${project.id}/chats`,
      phaseBadge: 'Phase 7',
    },
    {
      title: 'Files & Documents',
      description: 'Project documents, uploaded assets, and source files.',
      icon: <FileText size={18} />,
      to: `/projects/${project.id}/files`,
      phaseBadge: 'Phase 9',
    },
    {
      title: 'Notes & Code Snippets',
      description: 'Markdown scratchpads, documentation notes, and code blocks.',
      icon: <StickyNote size={18} />,
      to: `/projects/${project.id}/notes`,
      phaseBadge: 'Phase 9 & 14',
    },
    {
      title: 'Tasks & Backlog',
      description: 'Actionable items, checklists, and project deliverables.',
      icon: <CheckSquare size={18} />,
      to: `/projects/${project.id}/tasks`,
      phaseBadge: 'Phase 10',
    },
    {
      title: 'Architectural Decisions',
      description: 'Formal ADR logs and technical rationale for this project.',
      icon: <GitCommit size={18} />,
      to: `/projects/${project.id}/decisions`,
      phaseBadge: 'Phase 10',
    },
    {
      title: 'Links & Bookmarks',
      description: 'Curated external references, API docs, and repositories.',
      icon: <BookMarked size={18} />,
      to: `/projects/${project.id}/resources`,
      phaseBadge: 'Phase 9',
    },
    {
      title: 'Activity & Audit Log',
      description: 'Historical timeline of project changes and events.',
      icon: <Activity size={18} />,
      to: `/projects/${project.id}/activity`,
      phaseBadge: 'Phase 21',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Project Context & Instructions Foundation */}
      <ProjectContextPanel project={project} onProjectUpdated={onProjectUpdated} />

      {/* Metadata & Timeline Section */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {/* Project Information */}
        <Card variant="default">
          <CardHeader>
            <CardTitle
              style={{
                fontSize: 'var(--wb-text-sm)',
                color: 'var(--wb-color-fg-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <FolderGit2 size={16} color="var(--wb-color-primary)" />
              <span>Project Identity</span>
            </CardTitle>
          </CardHeader>
          <CardContent
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.625rem',
              fontSize: 'var(--wb-text-xs)',
            }}
          >
            <div>
              <span style={{ color: 'var(--wb-color-fg-subtle)' }}>Project ID: </span>
              <code style={{ fontSize: '11px', color: 'var(--wb-color-fg)' }}>{project.id}</code>
            </div>
            <div>
              <span style={{ color: 'var(--wb-color-fg-subtle)' }}>Workspace ID: </span>
              <code style={{ fontSize: '11px', color: 'var(--wb-color-fg)' }}>
                {project.workspaceId}
              </code>
            </div>
            <div>
              <span style={{ color: 'var(--wb-color-fg-subtle)' }}>URL Identifier: </span>
              <span style={{ fontWeight: 'var(--wb-weight-medium)', color: 'var(--wb-color-fg)' }}>
                {`/${project.slug}`}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Timeline & Activity */}
        <Card variant="default">
          <CardHeader>
            <CardTitle
              style={{
                fontSize: 'var(--wb-text-sm)',
                color: 'var(--wb-color-fg-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Clock size={16} color="var(--wb-color-primary)" />
              <span>Timeline & Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.625rem',
              fontSize: 'var(--wb-text-xs)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={14} color="var(--wb-color-fg-subtle)" />
              <span style={{ color: 'var(--wb-color-fg-subtle)' }}>Created: </span>
              <span>{new Date(project.createdAt).toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={14} color="var(--wb-color-fg-subtle)" />
              <span style={{ color: 'var(--wb-color-fg-subtle)' }}>Last Updated: </span>
              <span>{new Date(project.updatedAt).toLocaleString()}</span>
            </div>
            {project.archivedAt && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Archive size={14} color="var(--wb-color-warning)" />
                <span style={{ color: 'var(--wb-color-fg-subtle)' }}>Archived At: </span>
                <span>{new Date(project.archivedAt).toLocaleString()}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Quick Access Workspace Modules */}
      <div>
        <div style={{ marginBottom: '1.25rem' }}>
          <h2
            style={{
              fontSize: 'var(--wb-text-lg)',
              fontWeight: 'var(--wb-weight-semibold)',
              margin: 0,
              color: 'var(--wb-color-fg)',
            }}
          >
            Workspace Modules
          </h2>
          <p
            style={{
              fontSize: 'var(--wb-text-xs)',
              color: 'var(--wb-color-fg-muted)',
              margin: '0.25rem 0 0 0',
            }}
          >
            Structured organizational containers for all child activities in this project.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {modules.map((m) => (
            <ProjectModuleCard
              key={m.title}
              title={m.title}
              description={m.description}
              icon={m.icon}
              to={m.to}
              phaseBadge={m.phaseBadge}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
