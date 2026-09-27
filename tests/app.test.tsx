import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from '@/app/app';

describe('Root Application Component', () => {
  it('should render the application shell and overview without crashing', () => {
    render(<App />);

    expect(screen.getByText('WorkBench')).toBeInTheDocument();
    expect(screen.getByText('Phase 2 Design System Ready')).toBeInTheDocument();
    expect(screen.getByText('WorkBench Workspace Foundation')).toBeInTheDocument();
  });
});
