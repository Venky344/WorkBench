import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { MemoryStorageEngine } from '@/persistence/memory/memory.storage-engine';
import { createServiceContainer, ServiceContainer } from '@/services/container';
import { ServiceProvider } from '@/app/providers';
import { DecisionsPage } from '@/pages/DecisionsPage';

describe('Global DecisionsPage UI Flow', () => {
  let memoryEngine: MemoryStorageEngine;
  let services: ServiceContainer;

  beforeEach(async () => {
    memoryEngine = new MemoryStorageEngine();
    services = createServiceContainer(memoryEngine);
    await services.initialize();
  });

  const renderGlobalDecisions = () => {
    return render(
      <MemoryRouter initialEntries={['/decisions']}>
        <ServiceProvider services={services}>
          <Routes>
            <Route path="/decisions" element={<DecisionsPage />} />
          </Routes>
        </ServiceProvider>
      </MemoryRouter>,
    );
  };

  it('renders workspace decisions with project associations and allows workspace-wide recording', async () => {
    const user = userEvent.setup();
    const { workspace } = await services.workspaceService.getOrCreateDefaultWorkspace();
    const p1 = await services.projectService.createProject({
      workspaceId: workspace.id,
      name: 'Project One',
    });
    const p2 = await services.projectService.createProject({
      workspaceId: workspace.id,
      name: 'Project Two',
    });

    await services.decisionService.createDecision({
      workspaceId: workspace.id,
      projectId: p1.id,
      title: 'ADR-001: Decision in Project One',
      decision: 'Choice One',
      rationale: 'Rationale One',
    });

    await services.decisionService.createDecision({
      workspaceId: workspace.id,
      projectId: p2.id,
      title: 'ADR-002: Decision in Project Two',
      decision: 'Choice Two',
      rationale: 'Rationale Two',
    });

    renderGlobalDecisions();

    await waitFor(() => {
      expect(screen.getByText('ADR-001: Decision in Project One')).toBeInTheDocument();
      expect(screen.getByText('Project One')).toBeInTheDocument();
      expect(screen.getByText('ADR-002: Decision in Project Two')).toBeInTheDocument();
      expect(screen.getByText('Project Two')).toBeInTheDocument();
    });

    // Record a new decision assigned to Project Two
    const recordBtn = screen.getByRole('button', { name: /Record Decision/i });
    await user.click(recordBtn);

    const dialog = screen.getByRole('dialog');
    const projectSelect = within(dialog).getByLabelText(/Project/i);
    await user.selectOptions(projectSelect, p2.id);

    const titleInput = within(dialog).getByLabelText(/Decision Title/i);
    await user.type(titleInput, 'ADR-003: Global Decision Record');

    const decisionInput = within(dialog).getByLabelText(/Decision \(What was chosen\?\)/i);
    await user.type(decisionInput, 'Adopt universal event logging.');

    const rationaleInput = within(dialog).getByLabelText(/Context & Rationale/i);
    await user.type(rationaleInput, 'Ensures cross-module auditability.');

    const submitBtn = within(dialog).getByRole('button', { name: /Record Decision/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('ADR-003: Global Decision Record')).toBeInTheDocument();
    });
  });
});
