import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmptyState, LoadingState, ErrorState } from '@/components/ui';

describe('Design System: Structural State Components', () => {
  it('renders EmptyState with title, description and action', () => {
    const handleAction = vi.fn();
    render(
      <EmptyState
        title="No Projects Found"
        description="Create your first project to start organizing."
        actionLabel="Create Project"
        onAction={handleAction}
      />,
    );

    expect(screen.getByText('No Projects Found')).toBeInTheDocument();
    expect(screen.getByText('Create your first project to start organizing.')).toBeInTheDocument();
    const btn = screen.getByRole('button', { name: 'Create Project' });
    fireEvent.click(btn);
    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it('renders LoadingState with message and role="status"', () => {
    render(<LoadingState message="Fetching workspace entities..." />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Fetching workspace entities...')).toBeInTheDocument();
  });

  it('renders ErrorState with title, message, and retry button', () => {
    const handleRetry = vi.fn();
    render(
      <ErrorState
        title="Failed to Load"
        message="Network timeout while reading disk cache."
        onRetry={handleRetry}
      />,
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Failed to Load')).toBeInTheDocument();
    expect(screen.getByText('Network timeout while reading disk cache.')).toBeInTheDocument();
    const retryBtn = screen.getByRole('button', { name: 'Try Again' });
    fireEvent.click(retryBtn);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });
});
