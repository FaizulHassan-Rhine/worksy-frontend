'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, CheckCheck, Menu } from 'lucide-react';
import { APP_NAME } from '@/constants/branding';
import { ROUTES } from '@/constants/routes';
import { useWorkspace } from '@/hooks/useWorkspace';
import { formatDistanceToNow } from '@/lib/date';
import notificationService from '@/services/notificationService';

const POLL_INTERVAL_MS = 45000;

const getNotificationHref = (notification) => {
  if (notification.entityType === 'task') {
    if (notification.metadata?.projectId) {
      return ROUTES.projectDetail(notification.metadata.projectId);
    }
    if (notification.type === 'task_due_today' || notification.type === 'task_overdue') {
      return ROUTES.DAILY_TASKS;
    }
    return ROUTES.TASKS;
  }

  if (notification.entityType === 'project' && notification.entityId) {
    return ROUTES.projectDetail(notification.entityId);
  }

  if (notification.entityType === 'note' && notification.entityId) {
    return ROUTES.noteDetail(notification.entityId);
  }

  if (notification.entityType === 'file') {
    return ROUTES.FILES;
  }

  return ROUTES.DASHBOARD;
};

export default function Topbar({ onMenuClick }) {
  const router = useRouter();
  const { activeWorkspace, activeWorkspaceId } = useWorkspace();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const panelRef = useRef(null);

  const hasUnread = unreadCount > 0;

  const fetchNotifications = useMemo(
    () => async ({ silent = false } = {}) => {
      if (!activeWorkspaceId) {
        setItems([]);
        setUnreadCount(0);
        return;
      }

      if (!silent) {
        setIsLoading(true);
      }

      try {
        const data = await notificationService.getAll({
          workspaceId: activeWorkspaceId,
          limit: 10,
        });
        setItems(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      } catch {
        // Ignore fetch errors to keep topbar lightweight.
      } finally {
        if (!silent) {
          setIsLoading(false);
        }
      }
    },
    [activeWorkspaceId]
  );

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (!activeWorkspaceId) return;

    const timer = setInterval(() => {
      fetchNotifications({ silent: true });
    }, POLL_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [activeWorkspaceId, fetchNotifications]);

  useEffect(() => {
    const handleClickAway = (event) => {
      if (!panelRef.current) return;
      if (!panelRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickAway);
    return () => document.removeEventListener('mousedown', handleClickAway);
  }, []);

  const onMarkAllRead = async () => {
    if (!activeWorkspaceId || unreadCount === 0) return;
    try {
      await notificationService.markAllRead(activeWorkspaceId);
      setItems((prev) =>
        prev.map((item) => ({
          ...item,
          isRead: true,
          readAt: item.readAt || new Date().toISOString(),
        }))
      );
      setUnreadCount(0);
    } catch {
      // Ignore action errors to keep UI responsive.
    }
  };

  const onNotificationClick = async (notification) => {
    if (!notification.isRead) {
      try {
        await notificationService.markRead(notification.id);
        setItems((prev) =>
          prev.map((item) =>
            item.id === notification.id ? { ...item, isRead: true, readAt: new Date().toISOString() } : item
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch {
        // Ignore update failures and still allow navigation.
      }
    }

    setOpen(false);
    router.push(getNotificationHref(notification));
  };

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

      <div className="relative" ref={panelRef}>
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          aria-label="Open notifications"
        >
          <Bell className="h-4 w-4" />
          {hasUnread && (
            <span className="absolute -right-1 -top-1 min-w-[18px] rounded-full bg-red-500 px-1.5 py-0.5 text-center text-[10px] font-semibold text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {open && (
          <div className="absolute right-0 z-50 mt-2 w-[340px] overflow-hidden rounded-xl border border-zinc-200/80 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between border-b border-zinc-100 px-3.5 py-2.5 dark:border-zinc-800">
              <div>
                <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Notifications</p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  {unreadCount} unread
                </p>
              </div>
              <button
                type="button"
                onClick={onMarkAllRead}
                disabled={!hasUnread}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            </div>

            <div className="max-h-[360px] overflow-y-auto p-2">
              {isLoading ? (
                <p className="px-2 py-8 text-center text-xs text-zinc-500 dark:text-zinc-400">
                  Loading notifications...
                </p>
              ) : items.length === 0 ? (
                <p className="px-2 py-8 text-center text-xs text-zinc-500 dark:text-zinc-400">
                  No notifications yet.
                </p>
              ) : (
                <ul className="space-y-1">
                  {items.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => onNotificationClick(item)}
                        className={`w-full rounded-lg border px-2.5 py-2 text-left transition-colors ${
                          item.isRead
                            ? 'border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
                            : 'border-zinc-200/80 bg-zinc-50 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800/70 dark:hover:bg-zinc-800'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {!item.isRead && (
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-900 dark:bg-zinc-100" />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-medium text-zinc-900 dark:text-zinc-100">
                              {item.title}
                            </p>
                            <p className="mt-0.5 line-clamp-2 text-[11px] text-zinc-600 dark:text-zinc-300">
                              {item.message}
                            </p>
                            <p className="mt-1 text-[10px] text-zinc-400 dark:text-zinc-500">
                              {formatDistanceToNow(item.createdAt)}
                            </p>
                          </div>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
