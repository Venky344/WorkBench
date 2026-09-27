import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from '@/app/app';

describe('Root Application Component', () => {
  it('should render the application shell and overview without crashing', () => {
    render(<App />);

    expect(screen.getByAltText('WorkBench Logo')).toBeInTheDocument();
    expect(screen.getByText('Phase 3 App Shell Active')).toBeInTheDocument();
    expect(screen.getByText('Welcome to WorkBench')).toBeInTheDocument();
    expect(screen.getByRole('complementary', { name: 'Sidebar Navigation' })).toBeInTheDocument();
  });
});
