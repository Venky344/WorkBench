import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { MemoryStorageEngine } from '@/persistence/memory/memory.storage-engine';
import { createServiceContainer, ServiceContainer } from '@/services/container';
import { ServiceProvider } from '@/app/providers';
import { ProjectWorkspacePage, ProjectFilesPage } from '@/pages/project';

describe('ProjectFilesPage UI Flow', () => {
  let memoryEngine: MemoryStorageEngine;
  let services: ServiceContainer;

  beforeEach(async () => {
    memoryEngine = new MemoryStorageEngine();
    services = createServiceContainer(memoryEngine);
    await services.initialize();
  });

  const renderWorkspaceFiles = (projectId: string) => {
    return render(
      <MemoryRouter initialEntries={[`/projects/${projectId}/files`]}>
        <ServiceProvider services={services}>
          <Routes>
            <Route path="/projects/:projectId" element={<ProjectWorkspacePage />}>
              <Route path="files" element={<ProjectFilesPage />} />
            </Route>
            <Route path="/projects" element={<div>Projects Directory</div>} />
          </Routes>
        </ServiceProvider>
      </MemoryRouter>,
    );
  };

  it('renders empty state initially and uploads a file via dialog', async () => {
    const user = userEvent.setup();
    const { workspace } = await services.workspaceService.getOrCreateDefaultWorkspace();
    const project = await services.projectService.createProject({
      workspaceId: workspace.id,
      name: 'Alpha Project',
    });

    renderWorkspaceFiles(project.id);

    // Verify empty state
    await waitFor(() => {
      expect(screen.getByText('No files yet')).toBeInTheDocument();
    });

    // Click "Upload File" button
    const uploadBtn = screen.getByRole('button', { name: /Upload File/i });
    await user.click(uploadBtn);

    // Dialog should open
    expect(screen.getByText('Upload File Attachment')).toBeInTheDocument();

    // Create a fake file and simulate upload
    const file = new File(['mock content'], 'architecture.png', { type: 'image/png' });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).not.toBeNull();

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByDisplayValue('architecture.png')).toBeInTheDocument();
    });

    // Submit upload form
    const form = fileInput.closest('form');
    expect(form).not.toBeNull();
    if (form) {
      fireEvent.submit(form);
    }

    // File card should appear in the grid
    await waitFor(() => {
      expect(screen.getByText('architecture.png')).toBeInTheDocument();
    });

    // Verify persistence in service
    await waitFor(async () => {
      const files = await services.fileService.listFilesByProject(project.id);
      expect(files.length).toBe(1);
      expect(files[0]?.name).toBe('architecture.png');
    });
  });

  it('edits file metadata and deletes a file with confirmation', async () => {
    const user = userEvent.setup();
    const { workspace } = await services.workspaceService.getOrCreateDefaultWorkspace();
    const project = await services.projectService.createProject({
      workspaceId: workspace.id,
      name: 'Beta Project',
    });

    await services.fileService.uploadFile({
      workspaceId: workspace.id,
      projectId: project.id,
      name: 'Initial Spec',
      description: 'Initial description',
      file: {
        name: 'spec.txt',
        size: 12,
        type: 'text/plain',
        bytes: new TextEncoder().encode('Spec content'),
      },
    });

    renderWorkspaceFiles(project.id);

    await waitFor(() => {
      expect(screen.getByText('Initial Spec')).toBeInTheDocument();
    });

    // Click Edit button
    const editBtn = screen.getByLabelText('Edit metadata for Initial Spec');
    await user.click(editBtn);

    // Edit display name
    const nameInput = screen.getByDisplayValue('Initial Spec');
    await user.clear(nameInput);
    await user.type(nameInput, 'Revised Specification');

    const saveBtn = screen.getByRole('button', { name: /Save Changes/i });
    await user.click(saveBtn);

    await waitFor(() => {
      expect(screen.getByText('Revised Specification')).toBeInTheDocument();
    });

    // Delete file
    const deleteBtn = screen.getByLabelText('Delete Revised Specification');
    await user.click(deleteBtn);

    expect(screen.getByText('Delete File Attachment?')).toBeInTheDocument();
    const confirmDeleteBtn = screen.getByRole('button', { name: 'Delete File' });
    await user.click(confirmDeleteBtn);

    await waitFor(() => {
      expect(screen.getByText('No files yet')).toBeInTheDocument();
    });
  });
});
