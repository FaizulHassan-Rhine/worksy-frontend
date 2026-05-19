'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '@/constants/branding';
import authService from '@/services/authService';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isHydrating: false,
      hasHydrated: false,

      setAuth: (user, token) => {
        set({ user, token });
      },

      clearAuth: () => {
        set({ user: null, token: null });
      },

      setHasHydrated: (value) => {
        set({ hasHydrated: value });
      },

      hydrateFromServer: async () => {
        const { token } = get();
        if (!token) {
          set({ isHydrating: false });
          return;
        }

        set({ isHydrating: true });
        try {
          const data = await authService.me();
          set({ user: data.user, isHydrating: false });
        } catch {
          set({ user: null, token: null, isHydrating: false });
        }
      },
    }),
    {
      name: STORAGE_KEYS.auth,
      partialize: (state) => ({ user: state.user, token: state.token }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
