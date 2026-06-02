'use client';

import { useEffect } from 'react';
import ToastContainer from '@/components/ui/Toast';
import { DialogProvider } from '@/components/providers/DialogProvider';
import { LEGACY_STORAGE_KEYS, STORAGE_KEYS } from '@/constants/branding';
import { useThemeStore } from '@/store/themeStore';

function migrateStorageKey(newKey, oldKey) {
  if (typeof window === 'undefined') return;
  if (localStorage.getItem(newKey)) return;
  const legacy = localStorage.getItem(oldKey);
  if (!legacy) return;
  localStorage.setItem(newKey, legacy);
  localStorage.removeItem(oldKey);
}

export default function AppProviders({ children }) {
  const initTheme = useThemeStore((s) => s.initTheme);

  useEffect(() => {
    migrateStorageKey(STORAGE_KEYS.theme, LEGACY_STORAGE_KEYS.theme);
    migrateStorageKey(STORAGE_KEYS.auth, LEGACY_STORAGE_KEYS.auth);
    migrateStorageKey(STORAGE_KEYS.workspace, LEGACY_STORAGE_KEYS.workspace);
    initTheme();
  }, [initTheme]);

  return (
    <DialogProvider>
      {children}
      <ToastContainer />
    </DialogProvider>
  );
}
