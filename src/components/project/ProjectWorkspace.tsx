import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Project } from '@/domain/entities';
import { Button } from '@/components/ui';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { ProjectHeader } from './ProjectHeader';
import { ProjectNavigation } from './ProjectNavigation';

export interface ProjectWorkspaceContextValue {
  readonly project: Project;
  readonly onProjectUpdated: (updated: Project) => void;
  readonly onProjectDeleted: () => void;
}

export interface ProjectWorkspaceProps {
  readonly project: Project;
  readonly onProjectUpdated: (updated: Project) => void;
}

export const ProjectWorkspace: React.FC<ProjectWorkspaceProps> = ({
  project,
  onProjectUpdated,
}) => {
  const navigate = useNavigate();

  const handleProjectDeleted = () => {
    navigate('/projects');
  };

  const contextValue: ProjectWorkspaceContextValue = {
    project,
    onProjectUpdated,
    onProjectDeleted: handleProjectDeleted,
  };

  return (
    <div
      className="wb-project-workspace"
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
      }}
    >
      {/* Top Back Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<ArrowLeft size={16} />}
          onClick={() => navigate('/projects')}
        >
          Back to Projects Directory
        </Button>

        {project.isArchived && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              fontSize: 'var(--wb-text-xs)',
              color: 'var(--wb-color-warning)',
              backgroundColor: 'var(--wb-color-warning-subtle)',
              padding: '0.25rem 0.625rem',
              borderRadius: 'var(--wb-radius-md)',
              fontWeight: 'var(--wb-weight-medium)',
            }}
          >
            <AlertCircle size={14} />
            <span>This project is archived. Content is preserved in read-only mode.</span>
          </div>
        )}
      </div>

      {/* Project Header */}
      <ProjectHeader
        project={project}
        onProjectUpdated={onProjectUpdated}
        onProjectDeleted={handleProjectDeleted}
      />

      {/* Workspace Tabs Navigation */}
      <ProjectNavigation />

      {/* Workspace Active Section Content */}
      <div style={{ marginTop: '0.5rem' }}>
        <Outlet context={contextValue} />
      </div>
    </div>
  );
};
