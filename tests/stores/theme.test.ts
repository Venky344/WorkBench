import { describe, it, expect, beforeEach } from 'vitest';
import { useThemeStore } from '@/stores/theme.store';

describe('Theme Store & DOM synchronization', () => {
  beforeEach(() => {
    useThemeStore.getState().setTheme('dark');
  });

  it('sets theme and updates document attributes', () => {
    const { setTheme } = useThemeStore.getState();

    setTheme('light');
    expect(useThemeStore.getState().theme).toBe('light');
    expect(useThemeStore.getState().resolvedTheme).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');

    setTheme('dark');
    expect(useThemeStore.getState().theme).toBe('dark');
    expect(useThemeStore.getState().resolvedTheme).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('toggles theme between dark and light', () => {
    const { toggleTheme } = useThemeStore.getState();

    toggleTheme();
    expect(useThemeStore.getState().resolvedTheme).toBe('light');

    toggleTheme();
    expect(useThemeStore.getState().resolvedTheme).toBe('dark');
  });
});
