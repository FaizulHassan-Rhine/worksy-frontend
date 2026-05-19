'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CheckSquare,
  CalendarDays,
  AlertTriangle,
  FolderKanban,
  StickyNote,
  Files,
  FileText,
  Download,
  MessageCircle,
} from 'lucide-react';
import ColorTile from '@/components/ui/ColorTile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import StatCard from '@/components/dashboard/StatCard';
import { SkeletonStatGrid, SkeletonList } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspace } from '@/hooks/useWorkspace';
import dashboardService from '@/services/dashboardService';
import { ROUTES } from '@/constants/routes';
import { getFileUrl } from '@/lib/files';
import { formatDistanceToNow } from '@/lib/date';

export default function DashboardPage() {
  const { user } = useAuth();
  const { activeWorkspace, activeWorkspaceId } = useWorkspace();
  const [stats, setStats] = useState(null);
  const [recentNotes, setRecentNotes] = useState([]);
  const [recentFiles, setRecentFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    if (!activeWorkspaceId) {
      setStats(null);
      setRecentNotes([]);
      setRecentFiles([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const data = await dashboardService.getStats(activeWorkspaceId);
      setStats(data.stats);
      setRecentNotes(data.recentNotes || []);
      setRecentFiles(data.recentFiles || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
  }, [activeWorkspaceId]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div>
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Welcome back, {user?.name?.split(' ')[0] || 'there'}
        </h1>
        <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
          {activeWorkspace
            ? `Overview for ${activeWorkspace.name}`
            : 'Select a workspace to see your stats'}
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      {activeWorkspaceId && (
        <div className="grid grid-cols-2 gap-3">
          <ColorTile
            title="Team chat"
            description="Message everyone in your workspace"
            icon={MessageCircle}
            color="purple"
            href={ROUTES.CHAT}
          />
          <ColorTile
            title="Daily tasks"
            description="See what's due today and stay on track"
            icon={CalendarDays}
            color="green"
            href={ROUTES.DAILY_TASKS}
          />
        </div>
      )}

      {isLoading ? (
        <SkeletonStatGrid count={6} />
      ) : stats ? (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          <StatCard
            label="Total tasks"
            value={stats.totalTasks}
            icon={CheckSquare}
            href={ROUTES.TASKS}
            color="blue"
          />
          <StatCard
            label="Due today"
            value={stats.todayTasks}
            icon={CalendarDays}
            href={ROUTES.DAILY_TASKS}
            color="green"
          />
          <StatCard
            label="Overdue"
            value={stats.overdueTasks}
            icon={AlertTriangle}
            href={ROUTES.DAILY_TASKS}
            color="red"
          />
          <StatCard
            label="Active projects"
            value={stats.activeProjects}
            icon={FolderKanban}
            href={ROUTES.PROJECTS}
            color="amber"
          />
          <StatCard
            label="Notes"
            value={stats.totalNotes}
            icon={StickyNote}
            href={ROUTES.NOTES}
            color="purple"
          />
          <StatCard
            label="Files"
            value={stats.totalFiles}
            icon={Files}
            href={ROUTES.FILES}
            color="pink"
          />
        </div>
      ) : null}

      {!isLoading && stats && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent notes</CardTitle>
              <CardDescription>Latest updates in your workspace</CardDescription>
            </CardHeader>
            <CardContent>
              {recentNotes.length === 0 ? (
                <EmptyState
                  icon={StickyNote}
                  title="No notes yet"
                  description="Create a note to see it here."
                  className="py-10"
                />
              ) : (
                <ul className="space-y-3">
                  {recentNotes.map((note) => (
                    <li key={note.id}>
                      <Link
                        href={ROUTES.noteDetail(note.id)}
                        className="flex items-center gap-3 rounded-xl border border-zinc-200/80 p-3 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-400">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
                            {note.title}
                          </p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            {note.updatedAt
                              ? formatDistanceToNow(note.updatedAt)
                              : 'Recently updated'}
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent files</CardTitle>
              <CardDescription>Recently uploaded attachments</CardDescription>
            </CardHeader>
            <CardContent>
              {recentFiles.length === 0 ? (
                <EmptyState
                  icon={Files}
                  title="No files yet"
                  description="Upload files to see them here."
                  className="py-10"
                />
              ) : (
                <ul className="space-y-3">
                  {recentFiles.map((file) => (
                    <li key={file.id}>
                      <a
                        href={getFileUrl(file.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 rounded-xl border border-zinc-200/80 p-3 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                          <Files className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
                            {file.originalName || file.filename}
                          </p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            {file.createdAt
                              ? formatDistanceToNow(file.createdAt)
                              : 'Recently uploaded'}
                          </p>
                        </div>
                        <Download className="h-4 w-4 shrink-0 text-zinc-400" />
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {isLoading && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent notes</CardTitle>
            </CardHeader>
            <CardContent>
              <SkeletonList rows={3} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Recent files</CardTitle>
            </CardHeader>
            <CardContent>
              <SkeletonList rows={3} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
