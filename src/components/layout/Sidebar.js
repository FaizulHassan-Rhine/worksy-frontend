'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarDays,
  CheckSquare,
  FolderKanban,
  StickyNote,
  Files,
  Users,
  Settings,
  Layers,
  X,
  MessageCircle,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { APP_NAME } from '@/constants/branding';
import { ROUTES } from '@/constants/routes';
import { NAV_COLORS, NAV_ICON_STYLES } from '@/constants/colors';
import WorkspaceSwitcher from '@/components/workspace/WorkspaceSwitcher';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspaceStore } from '@/store/workspaceStore';
import authService from '@/services/authService';

const navItems = [
  { label: 'Dashboard', href: ROUTES.DASHBOARD, icon: LayoutDashboard, key: 'dashboard' },
  { label: 'Daily Tasks', href: ROUTES.DAILY_TASKS, icon: CalendarDays, key: 'daily' },
  { label: 'Tasks', href: ROUTES.TASKS, icon: CheckSquare, key: 'tasks' },
  { label: 'Projects', href: ROUTES.PROJECTS, icon: FolderKanban, key: 'projects' },
  { label: 'Notes', href: ROUTES.NOTES, icon: StickyNote, key: 'notes' },
  { label: 'Files', href: ROUTES.FILES, icon: Files, key: 'files' },
  { label: 'Chat', href: ROUTES.CHAT, icon: MessageCircle, key: 'chat' },
  { label: 'Team', href: ROUTES.TEAM, icon: Users, key: 'team' },
  { label: 'Settings', href: ROUTES.SETTINGS, icon: Settings, key: 'settings' },
];

export default function Sidebar({ mobileOpen = false, onMobileClose }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearAuth } = useAuth();

  const handleNavClick = () => {
    onMobileClose?.();
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // Client-side logout still proceeds
    } finally {
      clearAuth();
      useWorkspaceStore.getState().clearWorkspaces();
      router.replace(ROUTES.LOGIN);
    }
  };

  const initials = user?.name?.charAt(0)?.toUpperCase() || 'U';

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-50 flex h-full w-64 shrink-0 flex-col border-r border-zinc-200/80 bg-white transition-transform duration-300 ease-out dark:border-zinc-800 dark:bg-zinc-900 lg:static lg:translate-x-0',
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      <div className="flex h-11 shrink-0 items-center justify-between gap-2 px-5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
            <Layers className="h-4 w-4" />
          </div>
          <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-50">{APP_NAME}</p>
        </div>
        <button
          type="button"
          onClick={onMobileClose}
          className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 lg:hidden dark:hover:bg-zinc-800"
          aria-label="Close sidebar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <WorkspaceSwitcher />

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const colorKey = NAV_COLORS[item.key] || 'blue';
          const iconColor = NAV_ICON_STYLES[colorKey] || NAV_ICON_STYLES.blue;
          const isActive =
            pathname === item.href ||
            (item.href === ROUTES.PROJECTS && pathname.startsWith('/projects')) ||
            (item.href === ROUTES.TASKS && pathname.startsWith('/tasks')) ||
            (item.href === ROUTES.DAILY_TASKS && pathname.startsWith('/daily-tasks')) ||
            (item.href === ROUTES.NOTES && pathname.startsWith('/notes')) ||
            (item.href === ROUTES.FILES && pathname.startsWith('/files')) ||
            (item.href === ROUTES.CHAT && pathname.startsWith('/chat')) ||
            (item.href === ROUTES.TEAM && pathname.startsWith('/team'));

          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={handleNavClick}
              className={cn(
                'flex items-center gap-3 rounded-xl px-2.5 py-2.5 text-xs transition-all duration-200',
                isActive
                  ? 'bg-zinc-100 font-medium text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50'
                  : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-50'
              )}
            >
              <Icon className={cn('h-4 w-4 shrink-0', iconColor)} strokeWidth={2} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-zinc-200/80 p-3 dark:border-zinc-800">
        <div className="mb-2 flex items-center gap-2.5 px-1">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-zinc-900 dark:text-zinc-50">
              {user?.name || 'User'}
            </p>
            <p className="truncate text-[11px] text-zinc-500 dark:text-zinc-400">{user?.email}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Logout
        </button>
      </div>
    </aside>
  );
}
