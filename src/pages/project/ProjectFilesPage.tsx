import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { ProjectWorkspaceContextValue } from '@/components/project/ProjectWorkspace';
import { EmptyState } from '@/components/ui';
import { FileText } from 'lucide-react';

export const ProjectFilesPage: React.FC = () => {
  const { project } = useOutletContext<ProjectWorkspaceContextValue>();

  return (
    <div style={{ padding: '2rem 0' }}>
      <EmptyState
        icon={<FileText size={36} />}
        title="Project Files & Documents"
        description={`Files, assets, and document attachments for "${project.name}" will appear here. File management and attachment storage will be implemented in Phase 9.`}
      />
    </div>
  );
};
