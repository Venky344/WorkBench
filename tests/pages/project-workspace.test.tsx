import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { MemoryStorageEngine } from '@/persistence/memory/memory.storage-engine';
import { createServiceContainer, ServiceContainer } from '@/services/container';
import { ServiceProvider } from '@/app/providers';
import {
  ProjectWorkspacePage,
  ProjectOverviewPage,
  ProjectChatsPage,
  ProjectFilesPage,
  ProjectNotesPage,
  ProjectTasksPage,
  ProjectDecisionsPage,
  ProjectResourcesPage,
  ProjectActivityPage,
  ProjectSettingsPage,
} from '@/pages/project';
import { generateEntityId } from '@/domain/value-objects/id';

describe('Project Workspace Experience', () => {
  let memoryEngine: MemoryStorageEngine;
  let services: ServiceContainer;

  beforeEach(async () => {
    memoryEngine = new MemoryStorageEngine();
    services = createServiceContainer(memoryEngine);
    await services.initialize();
  });

  const renderWorkspace = (initialPath: string) => {
    return render(
      <MemoryRouter initialEntries={[initialPath]}>
        <ServiceProvider services={services}>
          <Routes>
            <Route path="/projects/:projectId" element={<ProjectWorkspacePage />}>
              <Route index element={<ProjectOverviewPage />} />
              <Route path="chats" element={<ProjectChatsPage />} />
              <Route path="files" element={<ProjectFilesPage />} />
              <Route path="notes" element={<ProjectNotesPage />} />
              <Route path="tasks" element={<ProjectTasksPage />} />
              <Route path="decisions" element={<ProjectDecisionsPage />} />
              <Route path="resources" element={<ProjectResourcesPage />} />
              <Route path="activity" element={<ProjectActivityPage />} />
              <Route path="settings" element={<ProjectSettingsPage />} />
            </Route>
            <Route path="/projects" element={<div>Projects Directory</div>} />
          </Routes>
        </ServiceProvider>
      </MemoryRouter>,
    );
  };

  it('renders project workspace header, navigation tabs, and overview on load', async () => {
    const { workspace } = await services.workspaceService.getOrCreateDefaultWorkspace();
    const project = await services.projectService.createProject({
      workspaceId: workspace.id,
      name: 'CricAuction Pro',
      description: 'Real-time player auction workspace',
      color: 'blue',
      icon: 'briefcase',
      tags: ['auction', 'react'],
      instructions: 'Architecture uses clean architecture with indexeddb persistence.',
    });

    renderWorkspace(`/projects/${project.id}`);

    await waitFor(() => {
      expect(screen.getByText('CricAuction Pro')).toBeInTheDocument();
      expect(screen.getByText('Real-time player auction workspace')).toBeInTheDocument();
      expect(screen.getAllByText('/cricauction-pro').length).toBeGreaterThanOrEqual(1);
    });

    // Verify Navigation Tabs
    expect(screen.getByRole('tab', { name: /Overview/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Chats/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Files/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Notes/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Tasks/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Decisions/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Resources/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Activity/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Settings/i })).toBeInTheDocument();

    // Verify Project Context Content
    expect(
      screen.getByText('Architecture uses clean architecture with indexeddb persistence.'),
    ).toBeInTheDocument();

    // Verify Module Cards
    expect(screen.getByText('Conversations & Chats')).toBeInTheDocument();
    expect(screen.getByText('Files & Documents')).toBeInTheDocument();
    expect(screen.getByText('Notes & Code Snippets')).toBeInTheDocument();
  });

  it('navigates through workspace tabs to view honest placeholders', async () => {
    const { workspace } = await services.workspaceService.getOrCreateDefaultWorkspace();
    const project = await services.projectService.createProject({
      workspaceId: workspace.id,
      name: 'Placeholders Test',
    });

    const user = userEvent.setup();
    renderWorkspace(`/projects/${project.id}`);

    await waitFor(() => {
      expect(screen.getByText('Placeholders Test')).toBeInTheDocument();
    });

    // 1. Navigate to Chats tab
    const chatsTab = screen.getByRole('tab', { name: /Chats/i });
    await user.click(chatsTab);

    await waitFor(() => {
      expect(screen.getByText('Project Conversations')).toBeInTheDocument();
      expect(screen.getByText('No conversations yet')).toBeInTheDocument();
    });

    // 2. Navigate to Files tab
    const filesTab = screen.getByRole('tab', { name: /Files/i });
    await user.click(filesTab);

    await waitFor(() => {
      expect(screen.getByText('Project Files & Documents')).toBeInTheDocument();
      expect(
        screen.getByText(/File management and attachment storage will be implemented in Phase 9/i),
      ).toBeInTheDocument();
    });

    // 3. Navigate to Tasks tab
    const tasksTab = screen.getByRole('tab', { name: /Tasks/i });
    await user.click(tasksTab);

    await waitFor(() => {
      expect(screen.getByText('Tasks & Work Items')).toBeInTheDocument();
      expect(
        screen.getByText(/Task management will be implemented in Phase 10/i),
      ).toBeInTheDocument();
    });

    // 4. Navigate to Decisions tab
    const decisionsTab = screen.getByRole('tab', { name: /Decisions/i });
    await user.click(decisionsTab);

    await waitFor(() => {
      expect(screen.getByText('Architectural Decisions')).toBeInTheDocument();
      expect(
        screen.getByText(/Decision tracking will be implemented in Phase 10/i),
      ).toBeInTheDocument();
    });

    // 5. Navigate to Activity tab
    const activityTab = screen.getByRole('tab', { name: /Activity/i });
    await user.click(activityTab);

    await waitFor(() => {
      expect(screen.getByText('Project Activity & History')).toBeInTheDocument();
      expect(
        screen.getByText(/Full activity history tracking will be implemented in Phase 21/i),
      ).toBeInTheDocument();
    });
  });

  it('edits project context instructions and persists changes', async () => {
    const { workspace } = await services.workspaceService.getOrCreateDefaultWorkspace();
    const project = await services.projectService.createProject({
      workspaceId: workspace.id,
      name: 'Context Editor Project',
    });

    const user = userEvent.setup();
    renderWorkspace(`/projects/${project.id}`);

    await waitFor(() => {
      expect(screen.getByText('Context Editor Project')).toBeInTheDocument();
    });

    // Click "Add Guidelines"
    const addBtn = screen.getByRole('button', { name: /Add Guidelines/i });
    await user.click(addBtn);

    // Type instructions
    const textarea = screen.getByPlaceholderText(/Document architectural guidelines/i);
    await user.type(textarea, 'Strict TypeScript rules and domain isolation enabled.');

    // Save
    const saveBtn = screen.getByRole('button', { name: /Save/i });
    await user.click(saveBtn);

    await waitFor(() => {
      expect(
        screen.getByText('Strict TypeScript rules and domain isolation enabled.'),
      ).toBeInTheDocument();
    });

    // Verify persisted in service
    const persisted = await services.projectService.getProject(project.id);
    expect(persisted.instructions).toBe('Strict TypeScript rules and domain isolation enabled.');
  });

  it('updates project settings from ProjectSettingsPage', async () => {
    const { workspace } = await services.workspaceService.getOrCreateDefaultWorkspace();
    const project = await services.projectService.createProject({
      workspaceId: workspace.id,
      name: 'Settings Test',
      description: 'Initial description',
    });

    const user = userEvent.setup();
    renderWorkspace(`/projects/${project.id}/settings`);

    await waitFor(() => {
      expect(screen.getByText('General Configuration')).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText(/Project Name/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Renamed in Settings');

    const saveChangesBtn = screen.getByRole('button', { name: /Save Changes/i });
    await user.click(saveChangesBtn);

    await waitFor(() => {
      expect(screen.getByText('Renamed in Settings')).toBeInTheDocument();
    });

    const persisted = await services.projectService.getProject(project.id);
    expect(persisted.name).toBe('Renamed in Settings');
  });

  it('handles project not found gracefully with error state', async () => {
    renderWorkspace(`/projects/${generateEntityId()}`);

    await waitFor(() => {
      expect(screen.getByText('Project Not Found')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Back to Projects' })).toBeInTheDocument();
    });
  });

  it('displays archived state indicator and allows restoring project', async () => {
    const { workspace } = await services.workspaceService.getOrCreateDefaultWorkspace();
    const project = await services.projectService.createProject({
      workspaceId: workspace.id,
      name: 'Archived Project',
    });
    await services.projectService.archiveProject(project.id);

    const user = userEvent.setup();
    renderWorkspace(`/projects/${project.id}`);

    await waitFor(() => {
      expect(screen.getByText('Archived Project')).toBeInTheDocument();
      expect(screen.getByText(/This project is archived/i)).toBeInTheDocument();
    });

    const restoreBtn = screen.getByRole('button', { name: 'Restore' });
    await user.click(restoreBtn);

    await waitFor(() => {
      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.queryByText(/This project is archived/i)).not.toBeInTheDocument();
    });
  });
});
