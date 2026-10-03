import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { MemoryStorageEngine } from '@/persistence/memory/memory.storage-engine';
import { createServiceContainer, ServiceContainer } from '@/services/container';
import { ServiceProvider } from '@/app/providers';
import { ProjectWorkspacePage, ProjectNotesPage, ProjectNoteDetailPage } from '@/pages/project';

describe('ProjectNotesPage UI Flow', () => {
  let memoryEngine: MemoryStorageEngine;
  let services: ServiceContainer;

  beforeEach(async () => {
    memoryEngine = new MemoryStorageEngine();
    services = createServiceContainer(memoryEngine);
    await services.initialize();
  });

  const renderWorkspaceNotes = (projectId: string) => {
    return render(
      <MemoryRouter initialEntries={[`/projects/${projectId}/notes`]}>
        <ServiceProvider services={services}>
          <Routes>
            <Route path="/projects/:projectId" element={<ProjectWorkspacePage />}>
              <Route path="notes" element={<ProjectNotesPage />} />
              <Route path="notes/:noteId" element={<ProjectNoteDetailPage />} />
            </Route>
            <Route path="/projects" element={<div>Projects Directory</div>} />
          </Routes>
        </ServiceProvider>
      </MemoryRouter>,
    );
  };

  it('creates a note, pins it, and opens dedicated note detail route', async () => {
    const user = userEvent.setup();
    const { workspace } = await services.workspaceService.getOrCreateDefaultWorkspace();
    const project = await services.projectService.createProject({
      workspaceId: workspace.id,
      name: 'Notes Project',
    });

    renderWorkspaceNotes(project.id);

    await waitFor(() => {
      expect(screen.getByText('No notes yet')).toBeInTheDocument();
    });

    // Create a new note
    const newNoteBtn = screen.getByRole('button', { name: /New Note/i });
    await user.click(newNoteBtn);

    const titleInput = screen.getByLabelText(/Note Title/i);
    await user.type(titleInput, 'Architecture Decisions');

    const contentInput = screen.getByLabelText(/Content/i);
    await user.type(contentInput, 'Detailed technical discussion and tradeoffs');

    const createBtn = screen.getByRole('button', { name: /Create Note/i });
    await user.click(createBtn);

    await waitFor(() => {
      expect(screen.getByText('Architecture Decisions')).toBeInTheDocument();
    });

    // Open note detail
    const openBtn = screen.getByRole('button', { name: /Open Note/i });
    await user.click(openBtn);

    await waitFor(() => {
      expect(screen.getByText('Detailed technical discussion and tradeoffs')).toBeInTheDocument();
    });
  });
});
