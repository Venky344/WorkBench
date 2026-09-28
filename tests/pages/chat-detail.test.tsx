import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { MemoryStorageEngine } from '@/persistence/memory/memory.storage-engine';
import { createServiceContainer, ServiceContainer } from '@/services/container';
import { ServiceProvider } from '@/app/providers';
import { ProjectWorkspacePage, ChatDetailPage } from '@/pages/project';
import { Project, Workspace, Chat } from '@/domain/entities';

describe('ChatDetailPage UI Experience', () => {
  let memoryEngine: MemoryStorageEngine;
  let services: ServiceContainer;
  let workspace: Workspace;
  let projectA: Project;
  let projectB: Project;
  let chatA: Chat;
  let chatB: Chat;

  beforeEach(async () => {
    memoryEngine = new MemoryStorageEngine();
    services = createServiceContainer(memoryEngine);
    await services.initialize();

    const init = await services.workspaceService.getOrCreateDefaultWorkspace();
    workspace = init.workspace;

    projectA = await services.projectService.createProject({
      workspaceId: workspace.id,
      name: 'Project Alpha',
    });

    projectB = await services.projectService.createProject({
      workspaceId: workspace.id,
      name: 'Project Beta',
    });

    const group = await services.chatGroupService.createGroup({
      workspaceId: workspace.id,
      projectId: projectA.id,
      name: 'Planning Group',
    });

    chatA = await services.chatService.createChat({
      workspaceId: workspace.id,
      projectId: projectA.id,
      chatGroupId: group.id,
      title: 'Alpha Architecture Session',
      description: 'Discussion regarding IndexedDB repository interfaces',
      tags: ['indexeddb', 'architecture'],
    });

    chatB = await services.chatService.createChat({
      workspaceId: workspace.id,
      projectId: projectB.id,
      title: 'Beta Private Session',
      description: 'Private Beta project details',
    });
  });

  const renderChatDetail = (initialPath: string) => {
    return render(
      <MemoryRouter initialEntries={[initialPath]}>
        <ServiceProvider services={services}>
          <Routes>
            <Route path="/projects/:projectId" element={<ProjectWorkspacePage />}>
              <Route path="chats/:chatId" element={<ChatDetailPage />} />
              <Route path="chats" element={<div>Project Chats Directory</div>} />
            </Route>
          </Routes>
        </ServiceProvider>
      </MemoryRouter>,
    );
  };

  it('renders chat detail metadata and honest message placeholder', async () => {
    renderChatDetail(`/projects/${projectA.id}/chats/${chatA.id}`);

    await waitFor(() => {
      expect(screen.getByText('Alpha Architecture Session')).toBeInTheDocument();
      expect(
        screen.getByText('Discussion regarding IndexedDB repository interfaces'),
      ).toBeInTheDocument();
    });

    // Verify group badge & organization info
    expect(screen.getAllByText('Planning Group').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('#indexeddb')).toBeInTheDocument();
    expect(screen.getByText('#architecture')).toBeInTheDocument();

    // Verify Honest Scope Boundary Notice
    expect(screen.getByText('Conversation Content Placeholder')).toBeInTheDocument();
    expect(
      screen.getByText(
        /Conversation content will be available when chat message functionality is implemented/i,
      ),
    ).toBeInTheDocument();
  });

  it('handles chat not found with error state', async () => {
    renderChatDetail(`/projects/${projectA.id}/chats/00000000-0000-0000-0000-000000000000`);

    await waitFor(() => {
      expect(screen.getByText('Conversation Not Found')).toBeInTheDocument();
    });
  });

  it('enforces project isolation: rejects rendering Chat B when requested under Project A', async () => {
    renderChatDetail(`/projects/${projectA.id}/chats/${chatB.id}`);

    await waitFor(() => {
      expect(screen.getByText('Conversation Not Found')).toBeInTheDocument();
      expect(
        screen.getByText(/Conversation does not belong to project "Project Alpha"/i),
      ).toBeInTheDocument();
    });
  });
});
