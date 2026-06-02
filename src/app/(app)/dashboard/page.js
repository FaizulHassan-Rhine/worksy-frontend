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
  Upload,
  MessageCircle,
  Plus,
  UserPlus,
  ArrowRight,
  History,
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
  const [recentActivities, setRecentActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    if (!activeWorkspaceId) {
      setStats(null);
      setRecentNotes([]);
      setRecentFiles([]);
      setRecentActivities([]);
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
      setRecentActivities(data.recentActivities || []);
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
    <div className="ml-2 mr-auto w-full max-w-[1400px] space-y-5 sm:ml-3">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
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

        <aside className="space-y-4 xl:sticky xl:top-4 xl:h-fit">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Focus today</CardTitle>
              <CardDescription>Quick glance for your current priorities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href={ROUTES.DAILY_TASKS}
                  className="rounded-lg border border-zinc-200/80 bg-zinc-50 p-2.5 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                >
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Due today</p>
                  <p className="mt-1 text-base font-semibold text-zinc-900 dark:text-zinc-50">
                    {stats?.todayTasks ?? 0}
                  </p>
                </Link>
                <Link
                  href={ROUTES.DAILY_TASKS}
                  className="rounded-lg border border-red-200/70 bg-red-50 p-2.5 transition-colors hover:bg-red-100 dark:border-red-900/70 dark:bg-red-950/50 dark:hover:bg-red-950"
                >
                  <p className="text-[11px] text-red-600 dark:text-red-300">Overdue</p>
                  <p className="mt-1 text-base font-semibold text-red-700 dark:text-red-200">
                    {stats?.overdueTasks ?? 0}
                  </p>
                </Link>
              </div>
              <div className="rounded-lg border border-zinc-200/80 p-2.5 dark:border-zinc-800">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Total tasks</p>
                  <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    {stats?.totalTasks ?? 0}
                  </p>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-zinc-900 transition-all dark:bg-zinc-100"
                    style={{
                      width:
                        (stats?.totalTasks ?? 0) > 0
                          ? `${Math.min(
                              100,
                              Math.round((((stats?.todayTasks ?? 0) + (stats?.overdueTasks ?? 0)) / stats.totalTasks) * 100)
                            )}%`
                          : '0%',
                    }}
                  />
                </div>
                <p className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                  {(stats?.todayTasks ?? 0) + (stats?.overdueTasks ?? 0)} tasks need attention
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Quick actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              <Link
                href={ROUTES.TASKS}
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200/80 px-2.5 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <Plus className="h-3.5 w-3.5" />
                New task
              </Link>
              <Link
                href={ROUTES.NOTES}
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200/80 px-2.5 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <Plus className="h-3.5 w-3.5" />
                New note
              </Link>
              <Link
                href={ROUTES.FILES}
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200/80 px-2.5 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <Upload className="h-3.5 w-3.5" />
                Upload file
              </Link>
              <Link
                href={ROUTES.TEAM}
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200/80 px-2.5 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <UserPlus className="h-3.5 w-3.5" />
                Invite
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Recent notes</CardTitle>
            </CardHeader>
            <CardContent>
              {recentNotes.length === 0 ? (
                <p className="text-xs text-zinc-500 dark:text-zinc-400">No recent notes yet.</p>
              ) : (
                <ul className="space-y-2">
                  {recentNotes.slice(0, 3).map((note) => (
                    <li key={`panel-note-${note.id}`}>
                      <Link
                        href={ROUTES.noteDetail(note.id)}
                        className="flex items-center gap-2 rounded-lg border border-zinc-200/80 px-2.5 py-2 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
                      >
                        <FileText className="h-3.5 w-3.5 shrink-0 text-violet-500" />
                        <span className="truncate text-xs font-medium text-zinc-700 dark:text-zinc-300">
                          {note.title}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              <Link
                href={ROUTES.NOTES}
                className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                View all notes
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Activity timeline</CardTitle>
              <CardDescription>Latest updates across your workspace</CardDescription>
            </CardHeader>
            <CardContent>
              {recentActivities.length === 0 ? (
                <p className="text-xs text-zinc-500 dark:text-zinc-400">No activity yet.</p>
              ) : (
                <ul className="space-y-2">
                  {recentActivities.slice(0, 6).map((activity) => (
                    <li key={activity.id}>
                      <Link
                        href={
                          activity.entityType === 'project'
                            ? ROUTES.projectDetail(activity.entityId)
                            : activity.entityType === 'note'
                              ? ROUTES.noteDetail(activity.entityId)
                              : activity.entityType === 'task'
                                ? ROUTES.TASKS
                                : activity.entityType === 'file'
                                  ? ROUTES.FILES
                                  : ROUTES.DASHBOARD
                        }
                        className="flex items-start gap-2 rounded-lg border border-zinc-200/80 px-2.5 py-2 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
                      >
                        <History className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-500 dark:text-zinc-400" />
                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium text-zinc-700 dark:text-zinc-300">
                            {activity.title}
                          </p>
                          <p className="truncate text-[11px] text-zinc-500 dark:text-zinc-400">
                            {activity.actor?.name ? `${activity.actor.name} · ` : ''}
                            {activity.details || 'Updated workspace'}
                          </p>
                          <p className="mt-0.5 text-[10px] text-zinc-400 dark:text-zinc-500">
                            {formatDistanceToNow(activity.createdAt)}
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
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Recent files</CardTitle>
            </CardHeader>
            <CardContent>
              {recentFiles.length === 0 ? (
                <p className="text-xs text-zinc-500 dark:text-zinc-400">No recent files yet.</p>
              ) : (
                <ul className="space-y-2">
                  {recentFiles.slice(0, 3).map((file) => (
                    <li key={`panel-file-${file.id}`}>
                      <a
                        href={getFileUrl(file.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-lg border border-zinc-200/80 px-2.5 py-2 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
                      >
                        <Files className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                        <span className="truncate text-xs font-medium text-zinc-700 dark:text-zinc-300">
                          {file.originalName || file.filename}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
              <Link
                href={ROUTES.FILES}
                className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                View all files
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
