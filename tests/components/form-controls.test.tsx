import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input, Textarea, Select, Checkbox, Switch } from '@/components/ui';

describe('Design System: Form Controls', () => {
  it('renders Input with label, placeholder, and handles change', () => {
    const handleChange = vi.fn();
    render(<Input label="Project Title" placeholder="Enter title" onChange={handleChange} />);

    expect(screen.getByLabelText('Project Title')).toBeInTheDocument();
    const input = screen.getByPlaceholderText('Enter title');
    fireEvent.change(input, { target: { value: 'New Workspace' } });
    expect(handleChange).toHaveBeenCalled();
  });

  it('renders Input in error state with accessible role="alert"', () => {
    render(<Input label="Email" errorMessage="Invalid email address" />);

    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid email address');
  });

  it('renders Textarea and accepts multiline input', () => {
    render(<Textarea label="Notes" defaultValue="Initial note" />);
    const textarea = screen.getByLabelText('Notes');
    expect(textarea).toHaveValue('Initial note');
  });

  it('renders Select with options', () => {
    const handleChange = vi.fn();
    render(
      <Select
        label="Provider"
        options={[
          { label: 'ChatGPT', value: 'chatgpt' },
          { label: 'Claude', value: 'claude' },
        ]}
        onChange={handleChange}
      />,
    );

    expect(screen.getByLabelText('Provider')).toBeInTheDocument();
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'claude' } });
    expect(handleChange).toHaveBeenCalled();
  });

  it('renders Checkbox and toggles value', () => {
    const handleChange = vi.fn();
    render(<Checkbox label="Enable Sync" checked={false} onChange={handleChange} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
    fireEvent.click(checkbox);
    expect(handleChange).toHaveBeenCalled();
  });

  it('renders Switch toggle with role="switch"', () => {
    const handleChange = vi.fn();
    render(<Switch label="Inbox Auto-Route" checked={true} onChange={handleChange} />);

    const switchBtn = screen.getByRole('switch');
    expect(switchBtn).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(switchBtn);
    expect(handleChange).toHaveBeenCalledWith(false);
  });
});
