'use client';

import { Menu } from 'lucide-react';
import { APP_NAME } from '@/constants/branding';
import { useWorkspace } from '@/hooks/useWorkspace';

export default function Topbar({ onMenuClick }) {
  const { activeWorkspace } = useWorkspace();

  return (
    <header className="flex h-12 items-center justify-between gap-3 border-b border-zinc-200/80 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-900 sm:px-5">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-50 lg:hidden dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="min-w-0">
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Workspace</p>
          <h2 className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            {activeWorkspace?.name || APP_NAME}
          </h2>
        </div>
      </div>
    </header>
  );
}
