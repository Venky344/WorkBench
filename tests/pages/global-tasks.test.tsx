import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { MemoryStorageEngine } from '@/persistence/memory/memory.storage-engine';
import { createServiceContainer, ServiceContainer } from '@/services/container';
import { ServiceProvider } from '@/app/providers';
import { TasksPage } from '@/pages/TasksPage';

describe('Global TasksPage UI Flow', () => {
  let memoryEngine: MemoryStorageEngine;
  let services: ServiceContainer;

  beforeEach(async () => {
    memoryEngine = new MemoryStorageEngine();
    services = createServiceContainer(memoryEngine);
    await services.initialize();
  });

  const renderGlobalTasks = () => {
    return render(
      <MemoryRouter initialEntries={['/tasks']}>
        <ServiceProvider services={services}>
          <Routes>
            <Route path="/tasks" element={<TasksPage />} />
          </Routes>
        </ServiceProvider>
      </MemoryRouter>,
    );
  };

  it('renders workspace tasks with project associations and allows workspace-wide creation', async () => {
    const user = userEvent.setup();
    const { workspace } = await services.workspaceService.getOrCreateDefaultWorkspace();
    const p1 = await services.projectService.createProject({
      workspaceId: workspace.id,
      name: 'Alpha Project',
    });
    const p2 = await services.projectService.createProject({
      workspaceId: workspace.id,
      name: 'Beta Project',
    });

    await services.taskService.createTask({
      workspaceId: workspace.id,
      projectId: p1.id,
      title: 'Task in Alpha',
    });

    await services.taskService.createTask({
      workspaceId: workspace.id,
      projectId: p2.id,
      title: 'Task in Beta',
    });

    renderGlobalTasks();

    await waitFor(() => {
      expect(screen.getByText('Task in Alpha')).toBeInTheDocument();
      expect(screen.getByText('Alpha Project')).toBeInTheDocument();
      expect(screen.getByText('Task in Beta')).toBeInTheDocument();
      expect(screen.getByText('Beta Project')).toBeInTheDocument();
    });

    // Create a new task globally assigned to Beta Project
    const newTaskBtn = screen.getByRole('button', { name: /New Task/i });
    await user.click(newTaskBtn);

    const dialog = screen.getByRole('dialog');
    const titleInput = within(dialog).getByLabelText(/Task Title/i);
    await user.type(titleInput, 'Global Created Task');

    const projectSelect = within(dialog).getByLabelText(/Assign to Project/i);
    await user.selectOptions(projectSelect, p2.id);

    const submitBtn = within(dialog).getByRole('button', { name: /Create Task/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Global Created Task')).toBeInTheDocument();
    });
  });
});
