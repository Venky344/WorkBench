import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { ProjectWorkspaceContextValue } from '@/components/project/ProjectWorkspace';
import { ProjectBrainContextPanel } from '@/components/brain';

export const ProjectBrainPage: React.FC = () => {
  const { project } = useOutletContext<ProjectWorkspaceContextValue>();

  return <ProjectBrainContextPanel project={project} />;
};
