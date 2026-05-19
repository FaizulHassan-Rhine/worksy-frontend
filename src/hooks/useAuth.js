'use client';

import { useAuthStore } from '@/store/authStore';

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const isHydrating = useAuthStore((state) => state.isHydrating);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const hydrateFromServer = useAuthStore((state) => state.hydrateFromServer);

  const isAuthenticated = Boolean(token);

  return {
    user,
    token,
    isHydrating,
    hasHydrated,
    isAuthenticated,
    setAuth,
    clearAuth,
    hydrateFromServer,
  };
}
