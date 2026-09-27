import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

describe('Design System: Button Primitive', () => {
  it('renders with children text and default primary variant', () => {
    render(<Button>Click Me</Button>);
    const btn = screen.getByRole('button', { name: 'Click Me' });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveClass('wb-button-primary');
  });

  it('renders different variants correctly', () => {
    const { rerender } = render(<Button variant="destructive">Delete</Button>);
    expect(screen.getByRole('button')).toHaveClass('wb-button-destructive');

    rerender(<Button variant="outline">Outline</Button>);
    expect(screen.getByRole('button')).toHaveClass('wb-button-outline');

    rerender(<Button variant="ghost">Ghost</Button>);
    expect(screen.getByRole('button')).toHaveClass('wb-button-ghost');
  });

  it('handles click events when enabled', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Action</Button>);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('prevents click when disabled or loading', () => {
    const handleClick = vi.fn();
    const { rerender } = render(
      <Button disabled onClick={handleClick}>
        Disabled
      </Button>,
    );

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();

    rerender(
      <Button isLoading onClick={handleClick}>
        Loading
      </Button>,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
  });
});
