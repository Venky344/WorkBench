import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { ProjectWorkspaceContextValue } from '@/components/project/ProjectWorkspace';
import { EmptyState } from '@/components/ui';
import { Activity } from 'lucide-react';

export const ProjectActivityPage: React.FC = () => {
  const { project } = useOutletContext<ProjectWorkspaceContextValue>();

  return (
    <div style={{ padding: '2rem 0' }}>
      <EmptyState
        icon={<Activity size={36} />}
        title="Project Activity & History"
        description={`Audit logs, workspace modification history, and entity timeline events for "${project.name}" will appear here. Full activity history tracking will be implemented in Phase 21.`}
      />
    </div>
  );
};
