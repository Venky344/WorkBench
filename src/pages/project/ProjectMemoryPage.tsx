import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { ProjectWorkspaceContextValue } from '@/components/project/ProjectWorkspace';
import { useWorkspaceContext } from '@/app/providers';
import { ProjectMemoryPanel } from '@/components/memory';

export const ProjectMemoryPage: React.FC = () => {
  const { project } = useOutletContext<ProjectWorkspaceContextValue>();
  const { workspace } = useWorkspaceContext();

  if (!workspace || !project) {
    return null;
  }

  return (
    <div
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
      }}
    >
      <div>
        <h2
          style={{
            margin: 0,
            fontSize: 'var(--wb-text-xl, 1.25rem)',
            fontWeight: 'var(--wb-weight-bold, 700)',
            color: 'var(--wb-color-fg-primary)',
          }}
        >
          Project Memory & Context
        </h2>
        <p
          style={{
            margin: '0.25rem 0 0 0',
            fontSize: 'var(--wb-text-sm, 0.875rem)',
            color: 'var(--wb-color-fg-muted, #64748b)',
          }}
        >
          Deliberately preserved facts, goals, constraints, conventions, and orientation context for
          &ldquo;{project.name}&rdquo;.
        </p>
      </div>

      <ProjectMemoryPanel workspaceId={workspace.id} projectId={project.id} />
    </div>
  );
};
