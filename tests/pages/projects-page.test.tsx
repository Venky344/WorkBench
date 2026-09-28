import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { MemoryStorageEngine } from '@/persistence/memory/memory.storage-engine';
import { createServiceContainer, ServiceContainer } from '@/services/container';
import { ServiceProvider } from '@/app/providers/ServiceProvider';
import { ProjectsPage } from '@/pages/ProjectsPage';

describe('ProjectsPage UI Flow', () => {
  let memoryEngine: MemoryStorageEngine;
  let services: ServiceContainer;

  beforeEach(async () => {
    memoryEngine = new MemoryStorageEngine();
    services = createServiceContainer(memoryEngine);
    await services.initialize();
  });

  const renderPage = () => {
    return render(
      <MemoryRouter initialEntries={['/projects']}>
        <ServiceProvider services={services}>
          <ProjectsPage />
        </ServiceProvider>
      </MemoryRouter>,
    );
  };

  it('renders clean empty state on fresh launch without demo data', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('No projects yet')).toBeInTheDocument();
    });

    expect(screen.getByText(/Organize your work into focused workspaces/i)).toBeInTheDocument();
  });

  it('creates a new project through CreateProjectDialog', async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('No projects yet')).toBeInTheDocument();
    });

    // Click "New Project" button in header
    const newProjectBtn = screen.getByRole('button', { name: /New Project/i });
    await user.click(newProjectBtn);

    // Modal opens
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText('Create New Project')).toBeInTheDocument();

    // Fill form
    const nameInput = within(dialog).getByLabelText(/Project Name/i);
    await user.type(nameInput, 'CricAuction Pro');

    const descInput = within(dialog).getByLabelText(/Description/i);
    await user.type(descInput, 'Live bidding workspace');

    // Submit within dialog
    const submitBtn = within(dialog).getByRole('button', { name: 'Create Project' });
    await user.click(submitBtn);

    // Modal closes and project card appears
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(screen.getByText('CricAuction Pro')).toBeInTheDocument();
      expect(screen.getByText('Live bidding workspace')).toBeInTheDocument();
    });
  });

  it('shows validation error when attempting to create project with empty name', async () => {
    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /New Project/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /New Project/i }));

    const dialog = screen.getByRole('dialog');
    const submitBtn = within(dialog).getByRole('button', { name: 'Create Project' });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(within(dialog).getByText('Project name is required')).toBeInTheDocument();
    });
  });

  it('filters projects by active, pinned, and archived', async () => {
    const { workspace } = await services.workspaceService.getOrCreateDefaultWorkspace();
    await services.projectService.createProject({
      workspaceId: workspace.id,
      name: 'Active Project',
    });
    const p2 = await services.projectService.createProject({
      workspaceId: workspace.id,
      name: 'Archived Project',
    });
    await services.projectService.archiveProject(p2.id);

    const user = userEvent.setup();
    renderPage();

    // Active filter (default)
    await waitFor(() => {
      expect(screen.getByText('Active Project')).toBeInTheDocument();
      expect(screen.queryByText('Archived Project')).not.toBeInTheDocument();
    });

    // Switch to Archived tab
    const archivedTab = screen.getByRole('tab', { name: /archived/i });
    await user.click(archivedTab);

    await waitFor(() => {
      expect(screen.getByText('Archived Project')).toBeInTheDocument();
      expect(screen.queryByText('Active Project')).not.toBeInTheDocument();
    });
  });

  it('searches projects by query', async () => {
    const { workspace } = await services.workspaceService.getOrCreateDefaultWorkspace();
    await services.projectService.createProject({
      workspaceId: workspace.id,
      name: 'Backend API',
    });
    await services.projectService.createProject({
      workspaceId: workspace.id,
      name: 'Frontend Shell',
    });

    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Backend API')).toBeInTheDocument();
      expect(screen.getByText('Frontend Shell')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search projects...');
    await user.type(searchInput, 'Backend');

    await waitFor(() => {
      expect(screen.getByText('Backend API')).toBeInTheDocument();
      expect(screen.queryByText('Frontend Shell')).not.toBeInTheDocument();
    });
  });

  it('edits a project and persists changes', async () => {
    const { workspace } = await services.workspaceService.getOrCreateDefaultWorkspace();
    const project = await services.projectService.createProject({
      workspaceId: workspace.id,
      name: 'Original Title',
    });

    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Original Title')).toBeInTheDocument();
    });

    // Open options dropdown
    const optionsBtn = screen.getByLabelText(`Project options for ${project.name}`);
    await user.click(optionsBtn);

    // Click "Edit Metadata"
    const editOption = screen.getByText('Edit Metadata');
    await user.click(editOption);

    // Edit modal appears
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    const nameInput = screen.getByLabelText(/Project Name/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Updated Title');

    const saveBtn = screen.getByRole('button', { name: 'Save Changes' });
    await user.click(saveBtn);

    // Changes reflected
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(screen.getByText('Updated Title')).toBeInTheDocument();
    });
  });

  it('deletes a project with confirmation dialog', async () => {
    const { workspace } = await services.workspaceService.getOrCreateDefaultWorkspace();
    const project = await services.projectService.createProject({
      workspaceId: workspace.id,
      name: 'To Be Deleted',
    });

    const user = userEvent.setup();
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('To Be Deleted')).toBeInTheDocument();
    });

    // Open options dropdown
    const optionsBtn = screen.getByLabelText(`Project options for ${project.name}`);
    await user.click(optionsBtn);

    // Click "Delete Project..."
    const deleteOption = screen.getByText('Delete Project...');
    await user.click(deleteOption);

    // Confirmation dialog
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Delete Project?')).toBeInTheDocument();

    const confirmBtn = screen.getByRole('button', { name: 'Delete Project' });
    await user.click(confirmBtn);

    // Project removed
    await waitFor(() => {
      expect(screen.queryByText('To Be Deleted')).not.toBeInTheDocument();
      expect(screen.getByText('No projects yet')).toBeInTheDocument();
    });
  });
});
