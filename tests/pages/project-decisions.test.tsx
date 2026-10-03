import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, within, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { MemoryStorageEngine } from '@/persistence/memory/memory.storage-engine';
import { createServiceContainer, ServiceContainer } from '@/services/container';
import { ServiceProvider } from '@/app/providers';
import { ProjectWorkspacePage, ProjectDecisionsPage } from '@/pages/project';

describe('ProjectDecisionsPage UI Flow', () => {
  let memoryEngine: MemoryStorageEngine;
  let services: ServiceContainer;

  beforeEach(async () => {
    memoryEngine = new MemoryStorageEngine();
    services = createServiceContainer(memoryEngine);
    await services.initialize();
  });

  const renderWorkspaceDecisions = (projectId: string) => {
    return render(
      <MemoryRouter initialEntries={[`/projects/${projectId}/decisions`]}>
        <ServiceProvider services={services}>
          <Routes>
            <Route path="/projects/:projectId" element={<ProjectWorkspacePage />}>
              <Route path="decisions" element={<ProjectDecisionsPage />} />
            </Route>
            <Route path="/projects" element={<div>Projects Directory</div>} />
          </Routes>
        </ServiceProvider>
      </MemoryRouter>,
    );
  };

  it('renders empty state initially, records an ADR, and opens details modal', async () => {
    const user = userEvent.setup();
    const { workspace } = await services.workspaceService.getOrCreateDefaultWorkspace();
    const project = await services.projectService.createProject({
      workspaceId: workspace.id,
      name: 'Architecture Decisions Project',
    });

    renderWorkspaceDecisions(project.id);

    await waitFor(() => {
      expect(screen.getByText('No decisions recorded')).toBeInTheDocument();
    });

    // Record a new decision
    const recordBtn = screen.getByRole('button', { name: /Record Decision/i });
    await user.click(recordBtn);

    const titleInput = screen.getByLabelText(/Decision Title/i);
    await user.type(titleInput, 'ADR-001: Local-First Storage Architecture');

    const decisionInput = screen.getByLabelText(/Decision \(What was chosen\?\)/i);
    await user.type(decisionInput, 'Use indexedDB with memory engine fallback.');

    const rationaleInput = screen.getByLabelText(/Context & Rationale/i);
    await user.type(rationaleInput, 'Enables 100% offline usage without server dependencies.');

    const dialog = screen.getByRole('dialog');
    const submitBtn = within(dialog).getByRole('button', { name: /Record Decision/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(screen.getByText('ADR-001: Local-First Storage Architecture')).toBeInTheDocument();
      expect(screen.getByText('Use indexedDB with memory engine fallback.')).toBeInTheDocument();
    });

    // Open full details
    const viewFullBtn = screen.getByRole('button', { name: /View Full Record/i });
    fireEvent.click(viewFullBtn);

    await waitFor(() => {
      expect(screen.getByText(/Record ID:/i)).toBeInTheDocument();
      expect(
        screen.getAllByText('Enables 100% offline usage without server dependencies.').length,
      ).toBeGreaterThanOrEqual(1);
    });
  });

  it('edits and deletes a decision record', async () => {
    const user = userEvent.setup();
    const { workspace } = await services.workspaceService.getOrCreateDefaultWorkspace();
    const project = await services.projectService.createProject({
      workspaceId: workspace.id,
      name: 'Decision Edit Project',
    });

    const decision = await services.decisionService.createDecision({
      workspaceId: workspace.id,
      projectId: project.id,
      title: 'ADR-002: Initial Logging Strategy',
      decision: 'Log to console.',
      rationale: 'Quick debugging.',
    });

    renderWorkspaceDecisions(project.id);

    await waitFor(() => {
      expect(screen.getByText('ADR-002: Initial Logging Strategy')).toBeInTheDocument();
    });

    // Edit decision
    const editBtn = screen.getByRole('button', { name: `Edit decision "${decision.title}"` });
    await user.click(editBtn);

    const titleInput = screen.getByLabelText(/Decision Title/i);
    await user.clear(titleInput);
    await user.type(titleInput, 'ADR-002: Structured Log Formatter');

    const saveBtn = screen.getByRole('button', { name: /Save Changes/i });
    await user.click(saveBtn);

    await waitFor(() => {
      expect(screen.getByText('ADR-002: Structured Log Formatter')).toBeInTheDocument();
    });

    // Delete decision
    vi.spyOn(window, 'confirm').mockImplementation(() => true);
    const deleteBtn = screen.getByRole('button', {
      name: `Delete decision "ADR-002: Structured Log Formatter"`,
    });
    await user.click(deleteBtn);

    await waitFor(() => {
      expect(screen.queryByText('ADR-002: Structured Log Formatter')).not.toBeInTheDocument();
      expect(screen.getByText('No decisions recorded')).toBeInTheDocument();
    });
  });
});
