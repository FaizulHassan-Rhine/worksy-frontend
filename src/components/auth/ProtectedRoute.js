'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspace } from '@/hooks/useWorkspace';
import { ROUTES } from '@/constants/routes';
import AppShell from '@/components/layout/AppShell';
import Spinner from '@/components/ui/Spinner';

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const { token, hasHydrated, isHydrating, hydrateFromServer } = useAuth();
  const { fetchWorkspaces, isLoading: workspacesLoading } = useWorkspace();

  useEffect(() => {
    if (hasHydrated && !token) {
      router.replace(ROUTES.LOGIN);
    }
  }, [hasHydrated, token, router]);

  useEffect(() => {
    if (hasHydrated && token) {
      hydrateFromServer();
      fetchWorkspaces();
    }
  }, [hasHydrated, token, hydrateFromServer, fetchWorkspaces]);

  if (!hasHydrated || !token || isHydrating || workspacesLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-zinc-950">
        <Spinner size="lg" />
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}
