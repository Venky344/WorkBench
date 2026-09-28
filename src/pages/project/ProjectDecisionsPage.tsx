import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { ProjectWorkspaceContextValue } from '@/components/project/ProjectWorkspace';
import { EmptyState } from '@/components/ui';
import { GitCommit } from 'lucide-react';

export const ProjectDecisionsPage: React.FC = () => {
  const { project } = useOutletContext<ProjectWorkspaceContextValue>();

  return (
    <div style={{ padding: '2rem 0' }}>
      <EmptyState
        icon={<GitCommit size={36} />}
        title="Architectural Decisions"
        description={`Architecture Decision Records (ADRs) and design trade-offs for "${project.name}" will be recorded here. Decision tracking will be implemented in Phase 10.`}
      />
    </div>
  );
};
