import { create } from 'zustand';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  durationMs?: number;
}

interface ToastState {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'>) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  addToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newToast: ToastItem = { ...toast, id };

    set((state) => ({ toasts: [...state.toasts, newToast] }));

    const duration = toast.durationMs ?? 4000;
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
      }, duration);
    }

    return id;
  },

  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },

  clearToasts: () => set({ toasts: [] }),
}));

export const toast = {
  info: (message: string, title?: string) =>
    useToastStore.getState().addToast({ type: 'info', message, title }),
  success: (message: string, title?: string) =>
    useToastStore.getState().addToast({ type: 'success', message, title }),
  warn: (message: string, title?: string) =>
    useToastStore.getState().addToast({ type: 'warning', message, title }),
  error: (message: string, title?: string) =>
    useToastStore.getState().addToast({ type: 'error', message, title }),
};
