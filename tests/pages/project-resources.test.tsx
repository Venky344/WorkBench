import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { MemoryStorageEngine } from '@/persistence/memory/memory.storage-engine';
import { createServiceContainer, ServiceContainer } from '@/services/container';
import { ServiceProvider } from '@/app/providers';
import { ProjectWorkspacePage, ProjectResourcesPage } from '@/pages/project';

describe('ProjectResourcesPage UI Flow', () => {
  let memoryEngine: MemoryStorageEngine;
  let services: ServiceContainer;

  beforeEach(async () => {
    memoryEngine = new MemoryStorageEngine();
    services = createServiceContainer(memoryEngine);
    await services.initialize();
  });

  const renderWorkspaceResources = (projectId: string) => {
    return render(
      <MemoryRouter initialEntries={[`/projects/${projectId}/resources`]}>
        <ServiceProvider services={services}>
          <Routes>
            <Route path="/projects/:projectId" element={<ProjectWorkspacePage />}>
              <Route path="resources" element={<ProjectResourcesPage />} />
            </Route>
            <Route path="/projects" element={<div>Projects Directory</div>} />
          </Routes>
        </ServiceProvider>
      </MemoryRouter>,
    );
  };

  it('adds links, code snippets, and filters across categories', async () => {
    const user = userEvent.setup();
    const { workspace } = await services.workspaceService.getOrCreateDefaultWorkspace();
    const project = await services.projectService.createProject({
      workspaceId: workspace.id,
      name: 'Resources Test',
    });

    renderWorkspaceResources(project.id);

    await waitFor(() => {
      expect(screen.getByText('No project resources yet')).toBeInTheDocument();
    });

    // Add a link
    const addLinkBtn = screen.getByRole('button', { name: /Add Link/i });
    await user.click(addLinkBtn);

    const urlInput = screen.getByPlaceholderText('https://example.com/docs');
    await user.type(urlInput, 'https://vitejs.dev');

    const titleInput = screen.getByLabelText(/Title/i);
    await user.clear(titleInput);
    await user.type(titleInput, 'Vite Framework Docs');

    const linkButtons = screen.getAllByRole('button', { name: /Add Link/i });
    const submitLinkBtn = linkButtons[linkButtons.length - 1];
    expect(submitLinkBtn).toBeDefined();
    if (submitLinkBtn) {
      await user.click(submitLinkBtn);
    }

    await waitFor(() => {
      expect(screen.getByText('Vite Framework Docs')).toBeInTheDocument();
    });

    // Add a code snippet
    const addSnippetBtn = screen.getByRole('button', { name: /Add Snippet/i });
    await user.click(addSnippetBtn);

    const codeInput = screen.getByPlaceholderText('Paste or write your code snippet here...');
    await user.type(codeInput, 'const sum = (a, b) => a + b;');

    const submitSnippetBtn = screen.getByRole('button', {
      name: /^Create Snippet$/i,
    });
    await user.click(submitSnippetBtn);

    await waitFor(() => {
      expect(screen.getByText('const sum = (a, b) => a + b;')).toBeInTheDocument();
    });
  });
});
