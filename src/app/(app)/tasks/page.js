'use client';

import { useCallback, useEffect, useState } from 'react';
import { BookmarkPlus, CalendarDays, CheckSquare, LayoutGrid, List, Plus, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import KanbanBoard from '@/components/task/KanbanBoard';
import TaskListView from '@/components/task/TaskListView';
import TaskCalendarView from '@/components/task/TaskCalendarView';
import CreateTaskModal from '@/components/task/CreateTaskModal';
import TaskDrawer from '@/components/task/TaskDrawer';
import { TASK_STATUSES, TASK_PRIORITIES } from '@/constants/task';
import { useWorkspace } from '@/hooks/useWorkspace';
import taskService from '@/services/taskService';
import Select from '@/components/ui/Select';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';
import savedViewService from '@/services/savedViewService';
import { useDialog } from '@/hooks/useDialog';

export default function TasksPage() {
  const { success, error: toastError } = useToast();
  const { confirm, prompt } = useDialog();
  const { activeWorkspace, activeWorkspaceId } = useWorkspace();
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState('kanban');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [savedViews, setSavedViews] = useState([]);
  const [activeSavedViewId, setActiveSavedViewId] = useState('');
  const [isViewActionLoading, setIsViewActionLoading] = useState(false);
  const [savedViewsUnsupported, setSavedViewsUnsupported] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  const loadTasks = useCallback(async () => {
    if (!activeWorkspaceId) {
      setTasks([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const params = { workspaceId: activeWorkspaceId };
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      const data = await taskService.getAll(params);
      setTasks(data.tasks);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  }, [activeWorkspaceId, statusFilter, priorityFilter]);

  const loadSavedViews = useCallback(async () => {
    if (!activeWorkspaceId) {
      setSavedViews([]);
      setActiveSavedViewId('');
      return;
    }

    try {
      const data = await savedViewService.getAll({
        workspaceId: activeWorkspaceId,
        module: 'tasks',
      });
      setSavedViews(data.views || []);
      setSavedViewsUnsupported(Boolean(data.unsupported));
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to load saved views');
    }
  }, [activeWorkspaceId, toastError]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    loadSavedViews();
  }, [loadSavedViews]);

  useEffect(() => {
    setActiveSavedViewId('');
  }, [activeWorkspaceId]);

  const handleCreate = async (payload) => {
    try {
      const data = await taskService.create(payload);
      setTasks((prev) => [data.task, ...prev]);
      success('Task created');
      return data;
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to create task');
      throw err;
    }
  };

  const handleStatusChange = async (taskId, status) => {
    try {
      const data = await taskService.updateStatus(taskId, status);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? data.task : t)));
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleTaskUpdated = (updated) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const handleTaskDeleted = (taskId) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setSelectedTaskId(null);
    success('Task deleted');
  };

  const onApplySavedView = (viewId) => {
    setActiveSavedViewId(viewId);
    if (!viewId) {
      return;
    }
    const selected = savedViews.find((item) => item.id === viewId);
    if (!selected) return;
    setStatusFilter(selected.filters?.status || '');
    setPriorityFilter(selected.filters?.priority || '');
    setView(selected.display?.view || 'kanban');
  };

  const onSaveCurrentView = async () => {
    if (!activeWorkspaceId) return;
    if (savedViewsUnsupported) return;
    const defaultName = activeSavedViewId
      ? savedViews.find((item) => item.id === activeSavedViewId)?.name || ''
      : '';
    const name = await prompt({
      title: activeSavedViewId ? 'Update saved view' : 'Save current view',
      description: 'Enter a name for this saved view.',
      defaultValue: defaultName,
      placeholder: 'Saved view name',
      confirmText: activeSavedViewId ? 'Update' : 'Save',
    });
    if (!name || !name.trim()) return;

    const payload = {
      workspaceId: activeWorkspaceId,
      module: 'tasks',
      name: name.trim(),
      filters: {
        status: statusFilter,
        priority: priorityFilter,
      },
      display: {
        view,
      },
    };

    setIsViewActionLoading(true);
    try {
      if (activeSavedViewId) {
        const data = await savedViewService.update(activeSavedViewId, payload);
        if (data.unsupported || !data.view) return;
        setSavedViews((prev) =>
          prev.map((item) => (item.id === activeSavedViewId ? data.view : item))
        );
        success('Saved view updated');
      } else {
        const data = await savedViewService.create(payload);
        if (data.unsupported || !data.view) return;
        setSavedViews((prev) => [data.view, ...prev]);
        setActiveSavedViewId(data.view.id);
        success('Saved view created');
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to save view');
    } finally {
      setIsViewActionLoading(false);
    }
  };

  const onDeleteSavedView = async () => {
    if (!activeSavedViewId) return;
    if (savedViewsUnsupported) return;
    const selected = savedViews.find((item) => item.id === activeSavedViewId);
    const confirmed = await confirm({
      title: 'Delete saved view',
      description: `Delete saved view "${selected?.name || ''}"?`,
      confirmText: 'Delete',
    });
    if (!confirmed) return;

    setIsViewActionLoading(true);
    try {
      await savedViewService.delete(activeSavedViewId);
      setSavedViews((prev) => prev.filter((item) => item.id !== activeSavedViewId));
      setActiveSavedViewId('');
      success('Saved view deleted');
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to delete view');
    } finally {
      setIsViewActionLoading(false);
    }
  };

  return (
    <div className="ml-2 mr-auto w-full max-w-[1400px] space-y-6 sm:ml-3">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-zinc-900">Tasks</h1>
          <p className="mt-0.5 text-xs text-zinc-500">
            {activeWorkspace
              ? `All tasks in ${activeWorkspace.name}`
              : 'Select a workspace to view tasks'}
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} disabled={!activeWorkspaceId}>
          <Plus className="h-4 w-4" />
          New task
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Select
            size="sm"
            className="w-full min-w-0 sm:w-[170px]"
            placeholder="Saved views"
            value={activeSavedViewId}
            onChange={(e) => onApplySavedView(e.target.value)}
            disabled={!activeWorkspaceId || savedViewsUnsupported}
            options={savedViews.map((item) => ({
              value: item.id,
              label: item.name,
            }))}
          />
          <Button
            size="sm"
            variant="secondary"
            disabled={!activeWorkspaceId || isViewActionLoading || savedViewsUnsupported}
            loading={isViewActionLoading}
            onClick={onSaveCurrentView}
          >
            <BookmarkPlus className="h-3.5 w-3.5" />
            {activeSavedViewId ? 'Update view' : 'Save view'}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            disabled={!activeSavedViewId || isViewActionLoading || savedViewsUnsupported}
            loading={isViewActionLoading}
            className="text-red-600 hover:bg-red-50"
            onClick={onDeleteSavedView}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
          <Select
            size="sm"
            className="w-full min-w-0 sm:w-[160px]"
            placeholder="All statuses"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setActiveSavedViewId('');
            }}
            options={TASK_STATUSES.map((s) => ({ value: s.value, label: s.label }))}
          />
          <Select
            size="sm"
            className="w-full min-w-0 sm:w-[160px]"
            placeholder="All priorities"
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value);
              setActiveSavedViewId('');
            }}
            options={TASK_PRIORITIES.map((p) => ({ value: p.value, label: p.label }))}
          />
        </div>

        <div className="flex rounded-xl border border-zinc-200 bg-white p-1">
          <button
            type="button"
            onClick={() => setView('kanban')}
            className={cn(
              'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
              view === 'kanban' ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-50'
            )}
          >
            <LayoutGrid className="h-4 w-4" />
            Board
          </button>
          <button
            type="button"
            onClick={() => setView('list')}
            className={cn(
              'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
              view === 'list' ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-50'
            )}
          >
            <List className="h-4 w-4" />
            List
          </button>
          <button
            type="button"
            onClick={() => setView('calendar')}
            className={cn(
              'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
              view === 'calendar' ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-50'
            )}
          >
            <CalendarDays className="h-4 w-4" />
            Calendar
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No tasks yet"
          description="Create your first task to start tracking work in this workspace."
          action={
            <Button onClick={() => setCreateOpen(true)} disabled={!activeWorkspaceId}>
              <Plus className="h-4 w-4" />
              Create task
            </Button>
          }
        />
      ) : view === 'kanban' ? (
        <KanbanBoard
          tasks={tasks}
          onTaskClick={(task) => setSelectedTaskId(task.id)}
          onStatusChange={handleStatusChange}
        />
      ) : view === 'calendar' ? (
        <TaskCalendarView tasks={tasks} onTaskClick={(task) => setSelectedTaskId(task.id)} />
      ) : (
        <TaskListView tasks={tasks} onTaskClick={(task) => setSelectedTaskId(task.id)} />
      )}

      <CreateTaskModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        workspaceId={activeWorkspaceId}
        onCreated={handleCreate}
      />

      <TaskDrawer
        taskId={selectedTaskId}
        open={Boolean(selectedTaskId)}
        onClose={() => setSelectedTaskId(null)}
        workspaceId={activeWorkspaceId}
        onUpdated={handleTaskUpdated}
        onDeleted={handleTaskDeleted}
      />
    </div>
  );
}
