import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { ProjectWorkspaceContextValue } from '@/components/project/ProjectWorkspace';
import { EmptyState } from '@/components/ui';
import { BookMarked } from 'lucide-react';

export const ProjectResourcesPage: React.FC = () => {
  const { project } = useOutletContext<ProjectWorkspaceContextValue>();

  return (
    <div style={{ padding: '2rem 0' }}>
      <EmptyState
        icon={<BookMarked size={36} />}
        title="Links & Resources"
        description={`External links, documentation references, and bookmarks for "${project.name}" will be indexed here. Resource library will be implemented in Phase 9.`}
      />
    </div>
  );
};
