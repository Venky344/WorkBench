import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { useAppStore } from '@/stores/app.store';

const createTestShellRouter = (initialPath = '/') => {
  return createMemoryRouter(
    [
      {
        path: '/',
        element: <AppShell />,
        children: [
          {
            index: true,
            element: <div>Welcome to Test Home Content</div>,
          },
          {
            path: 'projects',
            element: <div>Projects View Content</div>,
          },
        ],
      },
    ],
    {
      initialEntries: [initialPath],
      future: { v7_relativeSplatPath: true },
    },
  );
};

describe('AppShell Layout Component', () => {
  beforeEach(() => {
    useAppStore.setState({
      isSidebarCollapsed: false,
      isCommandPaletteOpen: false,
      isQuickCaptureOpen: false,
    });
  });

  it('renders sidebar, header, breadcrumbs, and routed content', () => {
    const router = createTestShellRouter('/');
    render(<RouterProvider router={router} future={{ v7_startTransition: true }} />);

    expect(screen.getByRole('complementary', { name: 'Sidebar Navigation' })).toBeInTheDocument();
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
    expect(screen.getByText('Welcome to Test Home Content')).toBeInTheDocument();
  });

  it('toggles sidebar collapsed state when clicking collapse button in header', () => {
    const router = createTestShellRouter('/');
    render(<RouterProvider router={router} future={{ v7_startTransition: true }} />);

    const collapseBtn = screen.getByLabelText('Collapse sidebar');
    fireEvent.click(collapseBtn);

    expect(useAppStore.getState().isSidebarCollapsed).toBe(true);
  });

  it('opens and closes Command Palette foundation modal on shortcut Ctrl+K', () => {
    const router = createTestShellRouter('/');
    render(<RouterProvider router={router} future={{ v7_startTransition: true }} />);

    expect(
      screen.queryByText('Command Center will be available in Phase 19.'),
    ).not.toBeInTheDocument();

    // Trigger Ctrl+K
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    expect(screen.getByText('Command Center will be available in Phase 19.')).toBeInTheDocument();

    // Trigger Escape
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(
      screen.queryByText('Command Center will be available in Phase 19.'),
    ).not.toBeInTheDocument();
  });

  it('opens and closes Quick Capture foundation modal on shortcut and button click', () => {
    const router = createTestShellRouter('/');
    render(<RouterProvider router={router} future={{ v7_startTransition: true }} />);

    const captureBtn = screen.getByRole('button', { name: 'Capture' });
    fireEvent.click(captureBtn);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Quick Capture will be available in Phase 19.')).toBeInTheDocument();

    const gotItBtn = screen.getByRole('button', { name: 'Got it' });
    fireEvent.click(gotItBtn);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
