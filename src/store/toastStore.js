'use client';

import { create } from 'zustand';

let toastId = 0;

export const useToastStore = create((set, get) => ({
  toasts: [],

  addToast: (toast) => {
    const id = ++toastId;
    const entry = {
      id,
      type: toast.type || 'success',
      message: toast.message,
      duration: toast.duration ?? 4000,
    };

    set({ toasts: [...get().toasts, entry] });

    if (entry.duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, entry.duration);
    }

    return id;
  },

  removeToast: (id) => {
    set({ toasts: get().toasts.filter((t) => t.id !== id) });
  },

  success: (message, duration) => get().addToast({ type: 'success', message, duration }),
  error: (message, duration) => get().addToast({ type: 'error', message, duration }),
  info: (message, duration) => get().addToast({ type: 'info', message, duration }),
}));
