import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { MemoryStorageEngine } from '@/persistence/memory/memory.storage-engine';
import { createServiceContainer, ServiceContainer } from '@/services/container';
import { ServiceProvider } from '@/app/providers';
import { ProjectWorkspacePage, ProjectTasksPage } from '@/pages/project';

describe('ProjectTasksPage UI Flow', () => {
  let memoryEngine: MemoryStorageEngine;
  let services: ServiceContainer;

  beforeEach(async () => {
    memoryEngine = new MemoryStorageEngine();
    services = createServiceContainer(memoryEngine);
    await services.initialize();
  });

  const renderWorkspaceTasks = (projectId: string) => {
    return render(
      <MemoryRouter initialEntries={[`/projects/${projectId}/tasks`]}>
        <ServiceProvider services={services}>
          <Routes>
            <Route path="/projects/:projectId" element={<ProjectWorkspacePage />}>
              <Route path="tasks" element={<ProjectTasksPage />} />
            </Route>
            <Route path="/projects" element={<div>Projects Directory</div>} />
          </Routes>
        </ServiceProvider>
      </MemoryRouter>,
    );
  };

  it('renders empty state initially, creates a task, and toggles completion', async () => {
    const user = userEvent.setup();
    const { workspace } = await services.workspaceService.getOrCreateDefaultWorkspace();
    const project = await services.projectService.createProject({
      workspaceId: workspace.id,
      name: 'Task Flow Project',
    });

    renderWorkspaceTasks(project.id);

    await waitFor(() => {
      expect(screen.getByText('No tasks yet')).toBeInTheDocument();
    });

    // Create a new task
    const newTaskBtn = screen.getByRole('button', { name: /New Task/i });
    await user.click(newTaskBtn);

    const titleInput = screen.getByLabelText(/Task Title/i);
    await user.type(titleInput, 'Implement Task Management Flow');

    const descInput = screen.getByLabelText(/Description/i);
    await user.type(descInput, 'Add full unit tests and UI validation');

    const createBtn = screen.getByRole('button', { name: /Create Task/i });
    await user.click(createBtn);

    await waitFor(() => {
      expect(screen.getByText('Implement Task Management Flow')).toBeInTheDocument();
      expect(screen.getByText('Add full unit tests and UI validation')).toBeInTheDocument();
    });

    // Toggle complete
    const checkbox = screen.getByRole('checkbox', {
      name: /Mark "Implement Task Management Flow"/i,
    });
    expect(checkbox).not.toBeChecked();

    await user.click(checkbox);

    await waitFor(() => {
      expect(checkbox).toBeChecked();
    });
  });

  it('edits and deletes a task with confirmation', async () => {
    const user = userEvent.setup();
    const { workspace } = await services.workspaceService.getOrCreateDefaultWorkspace();
    const project = await services.projectService.createProject({
      workspaceId: workspace.id,
      name: 'Task Edit Project',
    });

    const task = await services.taskService.createTask({
      workspaceId: workspace.id,
      projectId: project.id,
      title: 'Original Task Name',
      priority: 'low',
    });

    renderWorkspaceTasks(project.id);

    await waitFor(() => {
      expect(screen.getByText('Original Task Name')).toBeInTheDocument();
    });

    // Edit task
    const editBtn = screen.getByRole('button', { name: `Edit task "${task.title}"` });
    await user.click(editBtn);

    const titleInput = screen.getByLabelText(/Task Title/i);
    await user.clear(titleInput);
    await user.type(titleInput, 'Renamed Task Item');

    const saveBtn = screen.getByRole('button', { name: /Save Changes/i });
    await user.click(saveBtn);

    await waitFor(() => {
      expect(screen.getByText('Renamed Task Item')).toBeInTheDocument();
    });

    // Delete task
    vi.spyOn(window, 'confirm').mockImplementation(() => true);
    const deleteBtn = screen.getByRole('button', { name: `Delete task "Renamed Task Item"` });
    await user.click(deleteBtn);

    await waitFor(() => {
      expect(screen.queryByText('Renamed Task Item')).not.toBeInTheDocument();
      expect(screen.getByText('No tasks yet')).toBeInTheDocument();
    });
  });
});
