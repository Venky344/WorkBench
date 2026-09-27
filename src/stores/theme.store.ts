import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

interface ThemeState {
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const getSystemTheme = (): ResolvedTheme => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const resolveTheme = (theme: ThemeMode): ResolvedTheme => {
  if (theme === 'system') return getSystemTheme();
  return theme;
};

const applyThemeToDOM = (resolved: ResolvedTheme): void => {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', resolved);
    document.documentElement.style.colorScheme = resolved;
  }
};

export const useThemeStore = create<ThemeState>((set, get) => {
  const initialTheme: ThemeMode = 'dark';
  const initialResolved = resolveTheme(initialTheme);
  applyThemeToDOM(initialResolved);

  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', () => {
        if (get().theme === 'system') {
          const updatedResolved = getSystemTheme();
          applyThemeToDOM(updatedResolved);
          set({ resolvedTheme: updatedResolved });
        }
      });
    }
  }

  return {
    theme: initialTheme,
    resolvedTheme: initialResolved,

    setTheme: (theme: ThemeMode) => {
      const resolved = resolveTheme(theme);
      applyThemeToDOM(resolved);
      set({ theme, resolvedTheme: resolved });
    },

    toggleTheme: () => {
      const current = get().resolvedTheme;
      const next: ThemeMode = current === 'dark' ? 'light' : 'dark';
      const resolved = resolveTheme(next);
      applyThemeToDOM(resolved);
      set({ theme: next, resolvedTheme: resolved });
    },
  };
});
