import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { ProjectWorkspaceContextValue } from '@/components/project/ProjectWorkspace';
import { EmptyState } from '@/components/ui';
import { CheckSquare } from 'lucide-react';

export const ProjectTasksPage: React.FC = () => {
  const { project } = useOutletContext<ProjectWorkspaceContextValue>();

  return (
    <div style={{ padding: '2rem 0' }}>
      <EmptyState
        icon={<CheckSquare size={36} />}
        title="Tasks & Work Items"
        description={`Backlog items, checklists, and actionable deliverables for "${project.name}" will appear here. Task management will be implemented in Phase 10.`}
      />
    </div>
  );
};
