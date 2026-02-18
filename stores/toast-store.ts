import { create } from 'zustand';

export type ToastVariant = 'default' | 'destructive';

export type ToastItem = {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
};

type ToastStore = {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
};

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (t) =>
    set((state) => ({
      toasts: [...state.toasts, { ...t, id: Math.random().toString(36).slice(2) }],
    })),
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

export const toast = {
  success: (title: string, description?: string) =>
    useToastStore.getState().addToast({ title, description, variant: 'default' }),
  error: (title: string, description?: string) =>
    useToastStore.getState().addToast({ title, description, variant: 'destructive' }),
};
