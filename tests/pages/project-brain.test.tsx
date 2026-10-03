import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { MemoryStorageEngine } from '@/persistence/memory/memory.storage-engine';
import { createServiceContainer, ServiceContainer } from '@/services/container';
import { ServiceProvider } from '@/app/providers';
import { ProjectWorkspacePage, ProjectBrainPage } from '@/pages/project';

describe('ProjectBrainPage UI Flow', () => {
  let memoryEngine: MemoryStorageEngine;
  let services: ServiceContainer;

  beforeEach(async () => {
    memoryEngine = new MemoryStorageEngine();
    services = createServiceContainer(memoryEngine);
    await services.initialize();
  });

  const renderWorkspaceBrain = (projectId: string) => {
    return render(
      <MemoryRouter initialEntries={[`/projects/${projectId}/brain`]}>
        <ServiceProvider services={services}>
          <Routes>
            <Route path="/projects/:projectId" element={<ProjectWorkspacePage />}>
              <Route path="brain" element={<ProjectBrainPage />} />
            </Route>
            <Route path="/projects" element={<div>Projects Directory</div>} />
          </Routes>
        </ServiceProvider>
      </MemoryRouter>,
    );
  };

  it('renders stats, explicit connection empty state, creates a connection, and inspects context modal', async () => {
    const user = userEvent.setup();
    const { workspace } = await services.workspaceService.getOrCreateDefaultWorkspace();
    const project = await services.projectService.createProject({
      workspaceId: workspace.id,
      name: 'Brain UI Project',
    });

    const chat = await services.chatService.createChat({
      workspaceId: workspace.id,
      projectId: project.id,
      title: 'Brain UI Chat',
    });

    const note = await services.noteService.createNote({
      workspaceId: workspace.id,
      projectId: project.id,
      title: 'Brain UI Note',
      content: 'Brain note content',
    });

    renderWorkspaceBrain(project.id);

    // Verify stats and empty connections rendered
    await waitFor(() => {
      expect(screen.getByText(/Explicit Brain Connections/i)).toBeInTheDocument();
      expect(screen.getByText(/No explicit connections yet/i)).toBeInTheDocument();
      expect(screen.getByText(/Connected Resources Explorer/i)).toBeInTheDocument();
    });

    // Create a new connection
    const connectBtn = screen.getByRole('button', { name: /Connect Entities/i });
    await user.click(connectBtn);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(/Connect Entities in Brain/i)).toBeInTheDocument();
    });

    const dialog = screen.getByRole('dialog');
    const sourceSelect = within(dialog).getByLabelText(/Source Entity/i);

    // Wait until available entities are loaded into the select
    await waitFor(() => {
      expect(sourceSelect.querySelectorAll('option').length).toBeGreaterThan(1);
    });

    await user.selectOptions(sourceSelect, `chat:${chat.id}`);

    const targetSelect = within(dialog).getByLabelText(/Target Entity/i);
    await waitFor(() => {
      expect(targetSelect.querySelectorAll('option').length).toBeGreaterThan(1);
    });
    await user.selectOptions(targetSelect, `note:${note.id}`);

    const submitBtn = within(dialog).getByRole('button', { name: /Create Connection/i });
    expect(submitBtn).not.toBeDisabled();
    await user.click(submitBtn);

    // Verify the dialog closes and connection is displayed in the list
    await waitFor(
      () => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      },
      { timeout: 2000 },
    );

    expect(screen.queryByText(/No explicit connections yet/i)).not.toBeInTheDocument();
    expect(screen.getAllByText(/Brain UI Chat/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Brain UI Note/i).length).toBeGreaterThanOrEqual(1);

    // Inspect Source Context modal
    const inspectBtn = screen.getByTitle(/Inspect Source Context/i);
    await user.click(inspectBtn);

    await waitFor(() => {
      expect(screen.getByText(/Workspace Brain Context/i)).toBeInTheDocument();
      expect(screen.getByText(/Explicit Connections \(1\)/i)).toBeInTheDocument();
    });
  });
});
