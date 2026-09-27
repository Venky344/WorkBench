import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React, { useState } from 'react';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

const ProblemChild: React.FC<{ shouldThrow: boolean }> = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Controlled test explosion!');
  }
  return <div>Healthy Child Content</div>;
};

const ResetableComponent: React.FC = () => {
  const [hasError, setHasError] = useState(true);

  return (
    <div>
      <ProblemChild shouldThrow={hasError} />
      <button onClick={() => setHasError(false)}>Fix Error</button>
    </div>
  );
};

describe('ErrorBoundary', () => {
  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={false} />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Healthy Child Content')).toBeInTheDocument();
  });

  it('catches render errors and renders the FallbackView', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('WorkBench Encountered an Error')).toBeInTheDocument();
    expect(screen.getByText(/Controlled test explosion!/)).toBeInTheDocument();

    errorSpy.mockRestore();
  });

  it('allows recovery via retry callback', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ResetableComponent />
      </ErrorBoundary>,
    );

    expect(screen.getByText('WorkBench Encountered an Error')).toBeInTheDocument();

    // Click 'Try Again' button on ErrorBoundary
    const tryAgainBtn = screen.getByText('Try Again');
    fireEvent.click(tryAgainBtn);

    errorSpy.mockRestore();
  });
});
