import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { MemoryStorageEngine } from '@/persistence/memory/memory.storage-engine';
import { createServiceContainer, ServiceContainer } from '@/services/container';
import { ServiceProvider } from '@/app/providers/ServiceProvider';
import { ProjectDetailPage } from '@/pages/ProjectDetailPage';
import { generateEntityId } from '@/domain/value-objects/id';

describe('ProjectDetailPage', () => {
  let memoryEngine: MemoryStorageEngine;
  let services: ServiceContainer;

  beforeEach(async () => {
    memoryEngine = new MemoryStorageEngine();
    services = createServiceContainer(memoryEngine);
    await services.initialize();
  });

  const renderDetailPage = (projectId: string) => {
    return render(
      <MemoryRouter initialEntries={[`/projects/${projectId}`]}>
        <ServiceProvider services={services}>
          <Routes>
            <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
            <Route path="/projects" element={<div>Projects Directory</div>} />
          </Routes>
        </ServiceProvider>
      </MemoryRouter>,
    );
  };

  it('renders project metadata, identity, and section placeholders', async () => {
    const { workspace } = await services.workspaceService.getOrCreateDefaultWorkspace();
    const project = await services.projectService.createProject({
      workspaceId: workspace.id,
      name: 'Signature Studio',
      description: 'Design system architecture workspace',
      color: 'blue',
      icon: 'layers',
      tags: ['design', 'css'],
    });

    renderDetailPage(project.id);

    await waitFor(() => {
      expect(screen.getByText('Signature Studio')).toBeInTheDocument();
      expect(screen.getByText('Design system architecture workspace')).toBeInTheDocument();
      expect(screen.getByText('/signature-studio')).toBeInTheDocument();
      expect(screen.getByText('design')).toBeInTheDocument();
      expect(screen.getByText('css')).toBeInTheDocument();
      expect(screen.getByText('Conversations & Chats')).toBeInTheDocument();
      expect(screen.getByText('Architectural Decisions')).toBeInTheDocument();
    });
  });

  it('renders clean error state when project does not exist', async () => {
    renderDetailPage(generateEntityId());

    await waitFor(() => {
      expect(screen.getByText('Project Not Found')).toBeInTheDocument();
    });

    expect(screen.getByText(/This project may have been deleted/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Back to Projects' })).toBeInTheDocument();
  });

  it('toggles pin and archive from detail view', async () => {
    const { workspace } = await services.workspaceService.getOrCreateDefaultWorkspace();
    const project = await services.projectService.createProject({
      workspaceId: workspace.id,
      name: 'Detail Test',
    });

    const user = userEvent.setup();
    renderDetailPage(project.id);

    await waitFor(() => {
      expect(screen.getByText('Detail Test')).toBeInTheDocument();
    });

    // Pin project
    const pinBtn = screen.getByRole('button', { name: 'Pin' });
    await user.click(pinBtn);

    await waitFor(() => {
      expect(screen.getByText('Pinned')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Unpin' })).toBeInTheDocument();
    });

    // Archive project
    const archiveBtn = screen.getByRole('button', { name: 'Archive' });
    await user.click(archiveBtn);

    await waitFor(() => {
      expect(screen.getByText('Archived')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Restore' })).toBeInTheDocument();
    });
  });
});
