import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { ProjectWorkspaceContextValue } from '@/components/project/ProjectWorkspace';
import { EmptyState } from '@/components/ui';
import { StickyNote } from 'lucide-react';

export const ProjectNotesPage: React.FC = () => {
  const { project } = useOutletContext<ProjectWorkspaceContextValue>();

  return (
    <div style={{ padding: '2rem 0' }}>
      <EmptyState
        icon={<StickyNote size={36} />}
        title="Notes & Code Snippets"
        description={`Markdown notes, scratchpads, and code snippets for "${project.name}" will be organized here. Note management will be implemented in Phase 9 & 14.`}
      />
    </div>
  );
};
