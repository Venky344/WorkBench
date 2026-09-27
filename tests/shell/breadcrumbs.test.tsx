import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';

const createBreadcrumbsRouter = (initialPath: string) => {
  return createMemoryRouter(
    [
      {
        path: '*',
        element: <Breadcrumbs />,
      },
    ],
    {
      initialEntries: [initialPath],
      future: { v7_relativeSplatPath: true },
    },
  );
};

describe('Breadcrumbs Navigation Component', () => {
  it('renders root Home breadcrumb for "/" path', () => {
    const router = createBreadcrumbsRouter('/');
    render(<RouterProvider router={router} future={{ v7_startTransition: true }} />);

    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  it('renders multi-level breadcrumb trail for subpaths', () => {
    const router = createBreadcrumbsRouter('/projects');
    render(<RouterProvider router={router} future={{ v7_startTransition: true }} />);

    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
  });

  it('renders custom labels for recognized routes', () => {
    const router = createBreadcrumbsRouter('/decisions');
    render(<RouterProvider router={router} future={{ v7_startTransition: true }} />);

    expect(screen.getByText('Decision Log')).toBeInTheDocument();
  });
});
