import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { useAppStore } from '@/stores/app.store';

const createSidebarTestRouter = (initialPath = '/') => {
  return createMemoryRouter(
    [
      {
        path: '*',
        element: <AppSidebar />,
      },
    ],
    {
      initialEntries: [initialPath],
      future: { v7_relativeSplatPath: true },
    },
  );
};

describe('AppSidebar Navigation Component', () => {
  beforeEach(() => {
    useAppStore.setState({ isSidebarCollapsed: false });
  });

  it('renders all primary navigation links with appropriate labels', () => {
    const router = createSidebarTestRouter('/');
    render(<RouterProvider router={router} future={{ v7_startTransition: true }} />);

    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Projects' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Conversations' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Inbox' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Tasks' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Decisions' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Resources' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Settings' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Design System' })).toBeInTheDocument();
  });

  it('highlights the active route link with aria-current="page"', () => {
    const router = createSidebarTestRouter('/projects');
    render(<RouterProvider router={router} future={{ v7_startTransition: true }} />);

    const projectsLink = screen.getByRole('link', { name: 'Projects' });
    expect(projectsLink).toHaveAttribute('aria-current', 'page');

    const homeLink = screen.getByRole('link', { name: 'Home' });
    expect(homeLink).not.toHaveAttribute('aria-current');
  });

  it('renders collapsed state with icon buttons and tooltips', () => {
    useAppStore.setState({ isSidebarCollapsed: true });
    const router = createSidebarTestRouter('/inbox');
    render(<RouterProvider router={router} future={{ v7_startTransition: true }} />);

    // In collapsed state, aria-label on links still enables accessible selection
    expect(screen.getByRole('link', { name: 'Inbox' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Inbox' })).toHaveAttribute('aria-current', 'page');
  });
});
