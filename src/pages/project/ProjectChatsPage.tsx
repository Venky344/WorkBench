import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { ProjectWorkspaceContextValue } from '@/components/project/ProjectWorkspace';
import { EmptyState } from '@/components/ui';
import { MessageSquare } from 'lucide-react';

export const ProjectChatsPage: React.FC = () => {
  const { project } = useOutletContext<ProjectWorkspaceContextValue>();

  return (
    <div style={{ padding: '2rem 0' }}>
      <EmptyState
        icon={<MessageSquare size={36} />}
        title="Project Conversations"
        description={`Conversations, chat groups, and LLM sessions for "${project.name}" will be managed here. Chat management is scheduled for implementation in Phase 7.`}
      />
    </div>
  );
};
