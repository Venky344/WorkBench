import { describe, it, expect, beforeEach } from 'vitest';
import { useToastStore, toast } from '@/stores/toast.store';

describe('Toast Notification Store', () => {
  beforeEach(() => {
    useToastStore.getState().clearToasts();
  });

  it('adds and removes toast items', () => {
    const id = toast.success('Operation completed successfully', 'Success');
    expect(useToastStore.getState().toasts).toHaveLength(1);
    expect(useToastStore.getState().toasts[0]?.message).toBe('Operation completed successfully');
    expect(useToastStore.getState().toasts[0]?.type).toBe('success');

    useToastStore.getState().removeToast(id);
    expect(useToastStore.getState().toasts).toHaveLength(0);
  });

  it('supports error and info toasts', () => {
    toast.error('Network failure');
    toast.info('New message arrived');

    expect(useToastStore.getState().toasts).toHaveLength(2);
    expect(useToastStore.getState().toasts[0]?.type).toBe('error');
    expect(useToastStore.getState().toasts[1]?.type).toBe('info');
  });
});
