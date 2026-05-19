'use client';

import { useToastStore } from '@/store/toastStore';

export function useToast() {
  const success = useToastStore((s) => s.success);
  const error = useToastStore((s) => s.error);
  const info = useToastStore((s) => s.info);
  const addToast = useToastStore((s) => s.addToast);

  return { success, error, info, toast: addToast };
}
