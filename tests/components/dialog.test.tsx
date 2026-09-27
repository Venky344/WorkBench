import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Dialog, DialogFooter } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';

describe('Design System: Dialog Component', () => {
  it('does not render when isOpen is false', () => {
    render(
      <Dialog isOpen={false} onClose={vi.fn()} title="Test Dialog">
        <div>Dialog Content</div>
      </Dialog>,
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders modal content with title when isOpen is true', () => {
    render(
      <Dialog
        isOpen={true}
        onClose={vi.fn()}
        title="Create Project"
        description="Enter project details"
      >
        <div>Project Form Content</div>
        <DialogFooter>
          <Button>Save</Button>
        </DialogFooter>
      </Dialog>,
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Create Project')).toBeInTheDocument();
    expect(screen.getByText('Enter project details')).toBeInTheDocument();
    expect(screen.getByText('Project Form Content')).toBeInTheDocument();
  });

  it('triggers onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(
      <Dialog isOpen={true} onClose={handleClose} title="Test">
        <div>Content</div>
      </Dialog>,
    );

    const closeBtn = screen.getByLabelText('Close dialog');
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('triggers onClose when backdrop is clicked', () => {
    const handleClose = vi.fn();
    render(
      <Dialog isOpen={true} onClose={handleClose} title="Test">
        <div>Content</div>
      </Dialog>,
    );

    const backdrop = screen.getByTestId('dialog-backdrop');
    fireEvent.click(backdrop);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('closes on Escape key press', () => {
    const handleClose = vi.fn();
    render(
      <Dialog isOpen={true} onClose={handleClose} title="Test">
        <div>Content</div>
      </Dialog>,
    );

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
