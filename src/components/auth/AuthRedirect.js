'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import Spinner from '@/components/ui/Spinner';

export default function AuthRedirect({ children }) {
  const router = useRouter();
  const { isAuthenticated, hasHydrated } = useAuth();

  useEffect(() => {
    if (hasHydrated && isAuthenticated) {
      router.replace(ROUTES.DASHBOARD);
    }
  }, [hasHydrated, isAuthenticated, router]);

  if (!hasHydrated || isAuthenticated) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return children;
}
