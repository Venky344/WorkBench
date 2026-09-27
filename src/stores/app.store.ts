import { create } from 'zustand';

/**
 * State Management Strategy:
 * 1. Local UI State: Use React `useState` / `useReducer` for component-scoped transient UI.
 * 2. Feature State: Use dedicated feature stores (e.g., `useProjectsStore`) in future phases.
 * 3. Global App State: Use `useAppStore` strictly for cross-cutting shell and workspace state.
 */

export interface AppState {
  readonly isSidebarCollapsed: boolean;
  readonly isCommandPaletteOpen: boolean;
  readonly isQuickCaptureOpen: boolean;
  readonly activeModal: string | null;
  readonly isInitialized: boolean;

  // Actions
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setQuickCaptureOpen: (open: boolean) => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
  setInitialized: (initialized: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isSidebarCollapsed: false,
  isCommandPaletteOpen: false,
  isQuickCaptureOpen: false,
  activeModal: null,
  isInitialized: true,

  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),

  setSidebarCollapsed: (isSidebarCollapsed) => set({ isSidebarCollapsed }),

  setCommandPaletteOpen: (isCommandPaletteOpen) => set({ isCommandPaletteOpen }),

  setQuickCaptureOpen: (isQuickCaptureOpen) => set({ isQuickCaptureOpen }),

  openModal: (activeModal) => set({ activeModal }),

  closeModal: () => set({ activeModal: null }),

  setInitialized: (isInitialized) => set({ isInitialized }),
}));
