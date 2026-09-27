import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { TechnicalShell } from '@/components/layout/TechnicalShell';
import { HomePage } from '@/pages/HomePage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { DesignSystemShowcasePage } from '@/pages/DesignSystemShowcasePage';

const createTestRouter = (initialEntries: string[]) => {
  return createMemoryRouter(
    [
      {
        path: '/',
        element: <TechnicalShell />,
        errorElement: <NotFoundPage />,
        children: [
          {
            index: true,
            element: <HomePage />,
          },
          {
            path: 'showcase',
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
      initialEntries,
      future: {
        v7_relativeSplatPath: true,
      },
    },
  );
};

describe('Routing Foundation', () => {
  it('renders HomePage at root path "/"', () => {
    const router = createTestRouter(['/']);
    render(<RouterProvider router={router} future={{ v7_startTransition: true }} />);

    expect(screen.getByText('WorkBench Workspace Foundation')).toBeInTheDocument();
  });

  it('renders DesignSystemShowcasePage at "/showcase"', () => {
    const router = createTestRouter(['/showcase']);
    render(<RouterProvider router={router} future={{ v7_startTransition: true }} />);

    expect(screen.getByText('WorkBench Design System')).toBeInTheDocument();
    expect(screen.getByText('UI Components')).toBeInTheDocument();
  });

  it('renders NotFoundPage for unknown paths', () => {
    const router = createTestRouter(['/unknown/route/path']);
    render(<RouterProvider router={router} future={{ v7_startTransition: true }} />);

    expect(screen.getByText('404 - Page Not Found')).toBeInTheDocument();
    expect(screen.getByText('Return to Overview')).toBeInTheDocument();
  });
});
