import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { GlobalActions } from '@/components/layout/GlobalActions';
import { useAppStore } from '@/stores/app.store';
import { useToastStore } from '@/stores/toast.store';

const createGlobalActionsRouter = () => {
  return createMemoryRouter(
    [
      {
        path: '*',
        element: <GlobalActions />,
      },
    ],
    {
      initialEntries: ['/'],
      future: { v7_relativeSplatPath: true },
    },
  );
};

describe('GlobalActions Component', () => {
  beforeEach(() => {
    useAppStore.setState({ isCommandPaletteOpen: false, isQuickCaptureOpen: false });
    useToastStore.getState().clearToasts();
  });

  it('triggers command palette open on search button click', () => {
    const router = createGlobalActionsRouter();
    render(<RouterProvider router={router} future={{ v7_startTransition: true }} />);

    const searchBtn = screen.getByLabelText('Universal Search');
    fireEvent.click(searchBtn);

    expect(useAppStore.getState().isCommandPaletteOpen).toBe(true);
  });

  it('triggers quick capture modal open on capture button click', () => {
    const router = createGlobalActionsRouter();
    render(<RouterProvider router={router} future={{ v7_startTransition: true }} />);

    const captureBtn = screen.getByRole('button', { name: 'Capture' });
    fireEvent.click(captureBtn);

    expect(useAppStore.getState().isQuickCaptureOpen).toBe(true);
  });

  it('triggers notification toast on bell button click', () => {
    const router = createGlobalActionsRouter();
    render(<RouterProvider router={router} future={{ v7_startTransition: true }} />);

    const notifBtn = screen.getByLabelText('Notifications');
    fireEvent.click(notifBtn);

    expect(useToastStore.getState().toasts).toHaveLength(1);
    expect(useToastStore.getState().toasts[0]?.title).toBe('Workspace Notifications');
  });
});
