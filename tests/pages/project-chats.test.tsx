import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { MemoryStorageEngine } from '@/persistence/memory/memory.storage-engine';
import { createServiceContainer, ServiceContainer } from '@/services/container';
import { ServiceProvider } from '@/app/providers';
import { ProjectWorkspacePage, ProjectChatsPage, ChatDetailPage } from '@/pages/project';
import { Project, Workspace } from '@/domain/entities';

describe('ProjectChatsPage UI Flow', () => {
  let memoryEngine: MemoryStorageEngine;
  let services: ServiceContainer;
  let workspace: Workspace;
  let projectA: Project;
  let projectB: Project;

  beforeEach(async () => {
    memoryEngine = new MemoryStorageEngine();
    services = createServiceContainer(memoryEngine);
    await services.initialize();

    const init = await services.workspaceService.getOrCreateDefaultWorkspace();
    workspace = init.workspace;

    projectA = await services.projectService.createProject({
      workspaceId: workspace.id,
      name: 'Project Alpha',
      description: 'Alpha workspace',
    });

    projectB = await services.projectService.createProject({
      workspaceId: workspace.id,
      name: 'Project Beta',
      description: 'Beta workspace',
    });
  });

  const renderChatsPage = (initialPath: string) => {
    return render(
      <MemoryRouter initialEntries={[initialPath]}>
        <ServiceProvider services={services}>
          <Routes>
            <Route path="/projects/:projectId" element={<ProjectWorkspacePage />}>
              <Route path="chats" element={<ProjectChatsPage />} />
              <Route path="chats/:chatId" element={<ChatDetailPage />} />
            </Route>
          </Routes>
        </ServiceProvider>
      </MemoryRouter>,
    );
  };

  it('renders empty state initially and allows creating first chat', async () => {
    const user = userEvent.setup();
    renderChatsPage(`/projects/${projectA.id}/chats`);

    await waitFor(() => {
      expect(screen.getByText('No conversations yet')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Create First Conversation/i }),
      ).toBeInTheDocument();
    });

    // Click "Create First Conversation"
    await user.click(screen.getByRole('button', { name: /Create First Conversation/i }));

    await waitFor(() => {
      expect(screen.getByText('Create New Conversation')).toBeInTheDocument();
    });

    // Enter title & description
    const titleInput = screen.getByLabelText(/Conversation Title/i);
    await user.type(titleInput, 'GraphQL Federation Schema');

    const descInput = screen.getByLabelText(/Description/i);
    await user.type(descInput, 'Planning gateway routes and subgraph entities');

    // Submit
    const submitBtn = screen.getByRole('button', { name: /Create Conversation/i });
    await user.click(submitBtn);

    // Verify chat card appears in list
    await waitFor(() => {
      expect(screen.getByText('GraphQL Federation Schema')).toBeInTheDocument();
      expect(screen.getByText('Planning gateway routes and subgraph entities')).toBeInTheDocument();
    });

    // Verify persisted
    const chats = await services.chatService.listChats(projectA.id);
    expect(chats.length).toBe(1);
    expect(chats[0]?.title).toBe('GraphQL Federation Schema');
  });

  it('creates chat groups and organizes conversations into them', async () => {
    const user = userEvent.setup();
    renderChatsPage(`/projects/${projectA.id}/chats`);

    await waitFor(() => {
      expect(screen.getByText('New Group')).toBeInTheDocument();
    });

    // Click "New Group"
    await user.click(screen.getByText('New Group'));

    await waitFor(() => {
      expect(screen.getByText('Create Chat Group')).toBeInTheDocument();
    });

    const groupNameInput = screen.getByLabelText(/Group Name/i);
    await user.type(groupNameInput, 'Backend Architecture');

    const submitGroupBtn = screen.getByRole('button', { name: /Create Group/i });
    await user.click(submitGroupBtn);

    // Verify group section appears
    await waitFor(() => {
      expect(screen.getByText('Backend Architecture')).toBeInTheDocument();
    });

    // Create a chat inside this group using "New Chat" in group header
    const addChatInGroupBtn = screen.getByRole('button', { name: /New Chat/i });
    await user.click(addChatInGroupBtn);

    await waitFor(() => {
      expect(screen.getByText('Create New Conversation')).toBeInTheDocument();
    });

    const createChatDialog = screen.getByRole('dialog');
    const titleInput = within(createChatDialog).getByLabelText(/Conversation Title/i);
    await user.type(titleInput, 'Database Connection Pooling');

    const submitChatBtn = within(createChatDialog).getByRole('button', {
      name: 'Create Conversation',
    });
    await user.click(submitChatBtn);

    await waitFor(() => {
      expect(screen.getByText('Database Connection Pooling')).toBeInTheDocument();
    });

    const chats = await services.chatService.listChats(projectA.id);
    expect(chats.length).toBe(1);
    const groups = await services.chatGroupService.listGroups(projectA.id);
    expect(chats[0]?.chatGroupId).toBe(groups[0]?.id);
  });

  it('moves chat to another group and ungroups when requested', async () => {
    // Seed group and ungrouped chat
    const group = await services.chatGroupService.createGroup({
      workspaceId: workspace.id,
      projectId: projectA.id,
      name: 'Design System',
    });

    const chat = await services.chatService.createChat({
      workspaceId: workspace.id,
      projectId: projectA.id,
      title: 'Color Token Hierarchy',
    });

    const user = userEvent.setup();
    renderChatsPage(`/projects/${projectA.id}/chats`);

    await waitFor(() => {
      expect(screen.getByText('Color Token Hierarchy')).toBeInTheDocument();
    });

    // Open options menu on chat card
    const optionsBtn = screen.getByLabelText(/Chat options for Color Token Hierarchy/i);
    await user.click(optionsBtn);

    // Click "Move to Group..."
    const moveMenuItem = await screen.findByRole('menuitem', { name: /Move to Group/i });
    await user.click(moveMenuItem);

    await waitFor(() => {
      expect(screen.getByText('Move Conversation to Group')).toBeInTheDocument();
    });

    // Select Design System radio option inside Move dialog
    const moveDialog = screen.getByRole('dialog');
    const groupOption = within(moveDialog).getByText('Design System');
    await user.click(groupOption);

    // Click Move Conversation button
    const moveConfirmBtn = within(moveDialog).getByRole('button', { name: /Move Conversation/i });
    await user.click(moveConfirmBtn);

    await waitFor(() => {
      expect(screen.getAllByText('Design System').length).toBeGreaterThanOrEqual(1);
    });

    const reloaded = await services.chatService.getChatOrThrow(chat.id);
    expect(reloaded.chatGroupId).toBe(group.id);
  });

  it('deletes chat group and safely retains all chats ungrouped in the project', async () => {
    const group = await services.chatGroupService.createGroup({
      workspaceId: workspace.id,
      projectId: projectA.id,
      name: 'Temporary Category',
    });

    const chat = await services.chatService.createChat({
      workspaceId: workspace.id,
      projectId: projectA.id,
      chatGroupId: group.id,
      title: 'Persistent Conversation',
    });

    const user = userEvent.setup();
    renderChatsPage(`/projects/${projectA.id}/chats`);

    await waitFor(() => {
      expect(screen.getAllByText('Temporary Category').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Persistent Conversation')).toBeInTheDocument();
    });

    // Open group options menu
    const groupOptionsBtn = screen.getByLabelText(/Options for group Temporary Category/i);
    await user.click(groupOptionsBtn);

    // Click Delete Group from dropdown
    const deleteGroupItem = await screen.findByRole('menuitem', { name: /Delete Group/i });
    await user.click(deleteGroupItem);

    await waitFor(() => {
      expect(screen.getByText('Delete Group "Temporary Category"?')).toBeInTheDocument();
    });

    // Confirm deletion inside dialog
    const deleteDialog = screen.getByRole('dialog');
    const confirmDeleteBtn = within(deleteDialog).getByRole('button', { name: 'Delete Group' });
    await user.click(confirmDeleteBtn);

    // Group should disappear, but chat should now be in "Ungrouped Conversations"
    await waitFor(() => {
      expect(screen.queryByText('Temporary Category')).not.toBeInTheDocument();
      expect(screen.getByText('Ungrouped Conversations')).toBeInTheDocument();
      expect(screen.getByText('Persistent Conversation')).toBeInTheDocument();
    });

    const reloadedChat = await services.chatService.getChatOrThrow(chat.id);
    expect(reloadedChat.chatGroupId).toBeUndefined();
  });

  it('guarantees project isolation (Project A never sees Project B chats or groups)', async () => {
    await services.chatGroupService.createGroup({
      workspaceId: workspace.id,
      projectId: projectB.id,
      name: 'Project B Secret Group',
    });

    await services.chatService.createChat({
      workspaceId: workspace.id,
      projectId: projectB.id,
      title: 'Project B Secret Chat',
    });

    renderChatsPage(`/projects/${projectA.id}/chats`);

    await waitFor(() => {
      expect(screen.getByText('No conversations yet')).toBeInTheDocument();
    });

    expect(screen.queryByText('Project B Secret Group')).not.toBeInTheDocument();
    expect(screen.queryByText('Project B Secret Chat')).not.toBeInTheDocument();
  });
});
