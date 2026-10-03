import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { HomePage } from '@/pages/HomePage';
import { ProjectsPage } from '@/pages/ProjectsPage';
import { ProjectDetailPage } from '@/pages/ProjectDetailPage';
import { ChatsPage } from '@/pages/ChatsPage';
import { InboxPage } from '@/pages/InboxPage';
import { TasksPage } from '@/pages/TasksPage';
import { DecisionsPage } from '@/pages/DecisionsPage';
import { ResourcesPage } from '@/pages/ResourcesPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { DesignSystemShowcasePage } from '@/pages/DesignSystemShowcasePage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ServiceProvider } from '@/app/providers/ServiceProvider';
import { createServiceContainer } from '@/services/container';
import { MemoryStorageEngine } from '@/persistence/memory/memory.storage-engine';

const createTestRouter = (initialEntries: string[]) => {
  return createMemoryRouter(
    [
      {
        path: '/',
        element: <AppShell />,
        errorElement: <NotFoundPage />,
        children: [
          { index: true, element: <HomePage /> },
          { path: 'projects', element: <ProjectsPage /> },
          { path: 'projects/:projectId', element: <ProjectDetailPage /> },
          { path: 'chats', element: <ChatsPage /> },
          { path: 'inbox', element: <InboxPage /> },
          { path: 'tasks', element: <TasksPage /> },
          { path: 'decisions', element: <DecisionsPage /> },
          { path: 'resources', element: <ResourcesPage /> },
          { path: 'settings', element: <SettingsPage /> },
          { path: 'showcase', element: <DesignSystemShowcasePage /> },
          { path: 'design-system', element: <DesignSystemShowcasePage /> },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
    {
      initialEntries,
      future: {
        v7_relativeSplatPath: true,
      },
    },
  );
};

const renderWithProviders = (initialEntries: string[]) => {
  const router = createTestRouter(initialEntries);
  const memoryEngine = new MemoryStorageEngine();
  const services = createServiceContainer(memoryEngine);
  return render(
    <ServiceProvider services={services}>
      <RouterProvider router={router} future={{ v7_startTransition: true }} />
    </ServiceProvider>,
  );
};

describe('Routing Foundation with AppShell', () => {
  it('renders HomePage at root path "/"', () => {
    renderWithProviders(['/']);
    expect(screen.getByText('Welcome to WorkBench')).toBeInTheDocument();
  });

  it('renders ProjectsPage at "/projects"', async () => {
    renderWithProviders(['/projects']);
    expect(screen.getByRole('heading', { name: 'Projects', level: 1 })).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('No projects yet')).toBeInTheDocument();
    });
  });

  it('renders ChatsPage at "/chats"', async () => {
    renderWithProviders(['/chats']);
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Conversations/i, level: 1 })).toBeInTheDocument();
    });
  });

  it('renders InboxPage at "/inbox"', () => {
    renderWithProviders(['/inbox']);
    expect(
      screen.getByRole('heading', { name: 'Inbox Staging Area', level: 1 }),
    ).toBeInTheDocument();
  });

  it('renders TasksPage at "/tasks"', async () => {
    renderWithProviders(['/tasks']);
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Tasks', level: 1 })).toBeInTheDocument();
    });
  });

  it('renders DecisionsPage at "/decisions"', async () => {
    renderWithProviders(['/decisions']);
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Decision Log', level: 1 })).toBeInTheDocument();
    });
  });

  it('renders ResourcesPage at "/resources"', () => {
    renderWithProviders(['/resources']);
    expect(
      screen.getByRole('heading', { name: 'Resources & Reference Links', level: 1 }),
    ).toBeInTheDocument();
  });

  it('renders SettingsPage at "/settings"', () => {
    renderWithProviders(['/settings']);
    expect(
      screen.getByRole('heading', { name: 'Settings & Preferences', level: 1 }),
    ).toBeInTheDocument();
  });

  it('renders DesignSystemShowcasePage at "/showcase"', () => {
    renderWithProviders(['/showcase']);
    expect(screen.getByText('WorkBench Design System')).toBeInTheDocument();
  });

  it('renders ProjectDetailPage error state for non-existent "/projects/:projectId"', async () => {
    renderWithProviders(['/projects/non-existent-id']);
    await waitFor(() => {
      expect(screen.getByText('Project Not Found')).toBeInTheDocument();
    });
  });

  it('renders NotFoundPage for unknown paths', () => {
    renderWithProviders(['/unknown/route/path']);
    expect(screen.getByText('404 - Page Not Found')).toBeInTheDocument();
  });
});
