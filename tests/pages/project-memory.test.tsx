import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, within, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { MemoryStorageEngine } from '@/persistence/memory/memory.storage-engine';
import { createServiceContainer, ServiceContainer } from '@/services/container';
import { ServiceProvider } from '@/app/providers';
import { ProjectWorkspacePage, ProjectMemoryPage } from '@/pages/project';

describe('ProjectMemoryPage UI Flow', () => {
  let memoryEngine: MemoryStorageEngine;
  let services: ServiceContainer;

  beforeEach(async () => {
    memoryEngine = new MemoryStorageEngine();
    services = createServiceContainer(memoryEngine);
    await services.initialize();
  });

  const renderWorkspaceMemory = (projectId: string) => {
    return render(
      <MemoryRouter initialEntries={[`/projects/${projectId}/memory`]}>
        <ServiceProvider services={services}>
          <Routes>
            <Route path="/projects/:projectId" element={<ProjectWorkspacePage />}>
              <Route path="memory" element={<ProjectMemoryPage />} />
              <Route
                path="files"
                element={<div data-testid="files-page">Project Files Directory</div>}
              />
              <Route
                path="resources"
                element={<div data-testid="resources-page">Project Resources Directory</div>}
              />
              <Route
                path="chats/:chatId"
                element={<div data-testid="chat-page">Chat Detail View</div>}
              />
              <Route
                path="notes/:noteId"
                element={<div data-testid="note-page">Note Detail View</div>}
              />
            </Route>
            <Route path="/projects" element={<div>Projects Directory</div>} />
          </Routes>
        </ServiceProvider>
      </MemoryRouter>,
    );
  };

  it('renders empty state initially, creates a memory item, and opens details modal', async () => {
    const user = userEvent.setup();
    const { workspace } = await services.workspaceService.getOrCreateDefaultWorkspace();
    const project = await services.projectService.createProject({
      workspaceId: workspace.id,
      name: 'Memory System Project',
    });

    renderWorkspaceMemory(project.id);

    await waitFor(() => {
      expect(screen.getByText('No Project Memory Recorded')).toBeInTheDocument();
    });

    // Click Add Memory
    const addBtn = screen.getByRole('button', { name: /Create First Memory/i });
    await user.click(addBtn);

    const titleInput = screen.getByLabelText(/Title \*/i);
    await user.type(titleInput, 'Database engine is PostgreSQL 16 on Aurora');

    const contentInput = screen.getByLabelText(/Memory Content \*/i);
    await user.type(contentInput, 'Configured with read replica in us-west-2.');

    const dialog = screen.getByRole('dialog');
    const submitBtn = within(dialog).getByRole('button', { name: /Create Memory/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(screen.getByText('Database engine is PostgreSQL 16 on Aurora')).toBeInTheDocument();
      expect(screen.getByText('Configured with read replica in us-west-2.')).toBeInTheDocument();
    });

    // Open detail dialog by clicking on the title
    const memoryCardTitle = screen.getByText('Database engine is PostgreSQL 16 on Aurora');
    fireEvent.click(memoryCardTitle);

    await waitFor(() => {
      expect(screen.getByText(/Project Memory • Fact/i)).toBeInTheDocument();
      expect(screen.getByText('Source Record Provenance (0)')).toBeInTheDocument();
    });
  });

  it('edits, archives, restores, and deletes a memory item', async () => {
    const user = userEvent.setup();
    const { workspace } = await services.workspaceService.getOrCreateDefaultWorkspace();
    const project = await services.projectService.createProject({
      workspaceId: workspace.id,
      name: 'Memory Lifecycle Project',
    });

    await services.memoryService.createMemory({
      workspaceId: workspace.id,
      projectId: project.id,
      title: 'Initial Fact',
      content: 'Initial Fact Content',
      type: 'fact',
      importance: 'medium',
    });

    renderWorkspaceMemory(project.id);

    await waitFor(() => {
      expect(screen.getByText('Initial Fact')).toBeInTheDocument();
    });

    // Edit Memory
    const editBtn = screen.getByRole('button', { name: /Edit memory/i });
    await user.click(editBtn);

    const titleInput = screen.getByLabelText(/Title \*/i);
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated Fact Architecture');

    const saveBtn = screen.getByRole('button', { name: /Save Changes/i });
    await user.click(saveBtn);

    await waitFor(() => {
      expect(screen.getByText('Updated Fact Architecture')).toBeInTheDocument();
    });

    // Archive Memory
    const archiveBtn = screen.getByRole('button', { name: /Archive memory/i });
    await user.click(archiveBtn);

    await waitFor(() => {
      expect(screen.queryByText('Updated Fact Architecture')).not.toBeInTheDocument();
      expect(screen.getByText('No Project Memory Recorded')).toBeInTheDocument();
    });

    // View Archive Tab
    const archiveTabBtn = screen.getByRole('button', { name: /Archive \(1\)/i });
    await user.click(archiveTabBtn);

    await waitFor(() => {
      expect(screen.getByText('Updated Fact Architecture')).toBeInTheDocument();
      expect(screen.getAllByText('Archived').length).toBeGreaterThanOrEqual(1);
    });

    // Restore Memory
    const restoreBtn = screen.getByRole('button', { name: /Restore memory/i });
    await user.click(restoreBtn);

    // Switch back to All Active Tab
    const allTabBtn = screen.getByRole('button', { name: /All Active \(1\)/i });
    await user.click(allTabBtn);

    await waitFor(() => {
      expect(screen.getByText('Updated Fact Architecture')).toBeInTheDocument();
    });

    // Delete Memory
    const deleteBtn = screen.getByRole('button', { name: /Delete memory/i });
    await user.click(deleteBtn);

    const confirmDialog = screen.getByRole('dialog');
    const confirmDeleteBtn = within(confirmDialog).getByRole('button', { name: /Delete Memory/i });
    await user.click(confirmDeleteBtn);

    await waitFor(() => {
      expect(screen.queryByText('Updated Fact Architecture')).not.toBeInTheDocument();
      expect(screen.getByText('No Project Memory Recorded')).toBeInTheDocument();
    });
  });

  it('navigates to registered routes when clicking source chips on memory cards', async () => {
    const user = userEvent.setup();
    const { workspace } = await services.workspaceService.getOrCreateDefaultWorkspace();
    const project = await services.projectService.createProject({
      workspaceId: workspace.id,
      name: 'Source Navigation Project',
    });

    // 1. File source chip -> /projects/:projectId/files
    await services.memoryService.createMemory({
      workspaceId: workspace.id,
      projectId: project.id,
      title: 'Memory with File Source',
      content: 'References a file',
      type: 'fact',
      importance: 'medium',
      sourceReferences: [
        {
          entityType: 'file',
          entityId: 'file-xyz-123',
          title: 'architecture.pdf',
        },
      ],
    });

    const fileRender = renderWorkspaceMemory(project.id);

    await waitFor(() => {
      expect(screen.getByText('architecture.pdf')).toBeInTheDocument();
    });

    const fileChip = screen.getByText('architecture.pdf');
    await user.click(fileChip);

    await waitFor(() => {
      expect(screen.getByTestId('files-page')).toBeInTheDocument();
      expect(screen.getByText('Project Files Directory')).toBeInTheDocument();
    });

    fileRender.unmount();

    // 2. Resource source chips (link, bookmark, code_snippet, reference) -> /projects/:projectId/resources
    for (const type of ['link', 'bookmark', 'code_snippet', 'reference'] as const) {
      const chipTitle = `Source ${type} item`;
      const mem = await services.memoryService.createMemory({
        workspaceId: workspace.id,
        projectId: project.id,
        title: `Memory with ${type} Source`,
        content: `References a ${type}`,
        type: 'fact',
        importance: 'medium',
        sourceReferences: [
          {
            entityType: type,
            entityId: `${type}-id-123`,
            title: chipTitle,
          },
        ],
      });

      const rendered = renderWorkspaceMemory(project.id);

      await waitFor(() => {
        expect(screen.getByText(chipTitle)).toBeInTheDocument();
      });

      const chip = screen.getByText(chipTitle);
      await user.click(chip);

      await waitFor(() => {
        expect(screen.getByTestId('resources-page')).toBeInTheDocument();
        expect(screen.getByText('Project Resources Directory')).toBeInTheDocument();
      });

      rendered.unmount();
      await services.memoryService.deleteMemory(mem.id, project.id);
    }
  });
});
