import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { HomePage } from '@/pages/HomePage';
import { ProjectsPage } from '@/pages/ProjectsPage';
import { ChatsPage } from '@/pages/ChatsPage';
import { InboxPage } from '@/pages/InboxPage';
import { TasksPage } from '@/pages/TasksPage';
import { DecisionsPage } from '@/pages/DecisionsPage';
import { ResourcesPage } from '@/pages/ResourcesPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { DesignSystemShowcasePage } from '@/pages/DesignSystemShowcasePage';
import { NotFoundPage } from '@/pages/NotFoundPage';

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

describe('Routing Foundation with AppShell', () => {
  it('renders HomePage at root path "/"', () => {
    const router = createTestRouter(['/']);
    render(<RouterProvider router={router} future={{ v7_startTransition: true }} />);

    expect(screen.getByText('Welcome to WorkBench')).toBeInTheDocument();
  });

  it('renders ProjectsPage at "/projects"', () => {
    const router = createTestRouter(['/projects']);
    render(<RouterProvider router={router} future={{ v7_startTransition: true }} />);

    expect(screen.getByRole('heading', { name: 'Projects', level: 1 })).toBeInTheDocument();
    expect(screen.getByText('CricAuction')).toBeInTheDocument();
  });

  it('renders ChatsPage at "/chats"', () => {
    const router = createTestRouter(['/chats']);
    render(<RouterProvider router={router} future={{ v7_startTransition: true }} />);

    expect(screen.getByRole('heading', { name: 'Conversations', level: 1 })).toBeInTheDocument();
  });

  it('renders InboxPage at "/inbox"', () => {
    const router = createTestRouter(['/inbox']);
    render(<RouterProvider router={router} future={{ v7_startTransition: true }} />);

    expect(
      screen.getByRole('heading', { name: 'Inbox Staging Area', level: 1 }),
    ).toBeInTheDocument();
  });

  it('renders TasksPage at "/tasks"', () => {
    const router = createTestRouter(['/tasks']);
    render(<RouterProvider router={router} future={{ v7_startTransition: true }} />);

    expect(screen.getByRole('heading', { name: 'Tasks', level: 1 })).toBeInTheDocument();
  });

  it('renders DecisionsPage at "/decisions"', () => {
    const router = createTestRouter(['/decisions']);
    render(<RouterProvider router={router} future={{ v7_startTransition: true }} />);

    expect(screen.getByRole('heading', { name: 'Decision Log', level: 1 })).toBeInTheDocument();
  });

  it('renders ResourcesPage at "/resources"', () => {
    const router = createTestRouter(['/resources']);
    render(<RouterProvider router={router} future={{ v7_startTransition: true }} />);

    expect(
      screen.getByRole('heading', { name: 'Resources & Reference Links', level: 1 }),
    ).toBeInTheDocument();
  });

  it('renders SettingsPage at "/settings"', () => {
    const router = createTestRouter(['/settings']);
    render(<RouterProvider router={router} future={{ v7_startTransition: true }} />);

    expect(
      screen.getByRole('heading', { name: 'Settings & Preferences', level: 1 }),
    ).toBeInTheDocument();
  });

  it('renders DesignSystemShowcasePage at "/showcase"', () => {
    const router = createTestRouter(['/showcase']);
    render(<RouterProvider router={router} future={{ v7_startTransition: true }} />);

    expect(screen.getByText('WorkBench Design System')).toBeInTheDocument();
  });

  it('renders NotFoundPage for unknown paths', () => {
    const router = createTestRouter(['/unknown/route/path']);
    render(<RouterProvider router={router} future={{ v7_startTransition: true }} />);

    expect(screen.getByText('404 - Page Not Found')).toBeInTheDocument();
  });
});
