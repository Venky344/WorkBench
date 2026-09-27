import { createBrowserRouter } from 'react-router-dom';
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

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <AppShell />,
      errorElement: <NotFoundPage />,
      children: [
        {
          index: true,
          element: <HomePage />,
        },
        {
          path: 'projects',
          element: <ProjectsPage />,
        },
        {
          path: 'chats',
          element: <ChatsPage />,
        },
        {
          path: 'inbox',
          element: <InboxPage />,
        },
        {
          path: 'tasks',
          element: <TasksPage />,
        },
        {
          path: 'decisions',
          element: <DecisionsPage />,
        },
        {
          path: 'resources',
          element: <ResourcesPage />,
        },
        {
          path: 'settings',
          element: <SettingsPage />,
        },
        {
          path: 'showcase',
          element: <DesignSystemShowcasePage />,
        },
        {
          path: 'design-system',
          element: <DesignSystemShowcasePage />,
        },
        {
          path: '*',
          element: <NotFoundPage />,
        },
      ],
    },
  ],
  {
    future: {
      v7_relativeSplatPath: true,
    },
  },
);
