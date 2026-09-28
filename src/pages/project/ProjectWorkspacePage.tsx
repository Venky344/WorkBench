import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Project } from '@/domain/entities';
import { useProjectService } from '@/app/providers';
import { Skeleton, ErrorState } from '@/components/ui';
import { ProjectWorkspace } from '@/components/project';

export const ProjectWorkspacePage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const projectService = useProjectService();

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProject = useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);
    setError(null);
    try {
      const found = await projectService.getProject(projectId);
      setProject(found);
    } catch {
      setError('Project not found. This project may have been deleted or is unavailable.');
    } finally {
      setIsLoading(false);
    }
  }, [projectId, projectService]);

  useEffect(() => {
    void loadProject();
  }, [loadProject]);

  if (isLoading) {
    return (
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          width: '100%',
        }}
      >
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Skeleton circle width="3.25rem" height="3.25rem" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
            <Skeleton width="35%" height="2rem" />
            <Skeleton width="55%" height="1.25rem" />
          </div>
        </div>
        <Skeleton height="3rem" />
        <Skeleton height="280px" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div style={{ maxWidth: '600px', margin: '3rem auto', textAlign: 'center' }}>
        <ErrorState
          title="Project Not Found"
          message={error ?? 'This project may have been deleted or is unavailable.'}
          retryLabel="Back to Projects"
          onRetry={() => navigate('/projects')}
        />
      </div>
    );
  }

  return <ProjectWorkspace project={project} onProjectUpdated={setProject} />;
};
