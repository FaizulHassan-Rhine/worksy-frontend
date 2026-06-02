'use client';

import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, BookmarkPlus, CalendarDays, Clock, Sun, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import DailyTaskItem from '@/components/daily/DailyTaskItem';
import QuickAddTask from '@/components/daily/QuickAddTask';
import Select from '@/components/ui/Select';
import TaskDrawer from '@/components/task/TaskDrawer';
import { TASK_PRIORITIES } from '@/constants/task';
import { useWorkspace } from '@/hooks/useWorkspace';
import taskService from '@/services/taskService';
import savedViewService from '@/services/savedViewService';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';
import { useDialog } from '@/hooks/useDialog';

function TaskSection({
  title,
  description,
  icon: Icon,
  tasks,
  onComplete,
  onTaskClick,
  showDueDate,
  accent,
}) {
  if (tasks.length === 0) {
    return null;
  }

  return (
    <Card className={cn(accent)}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100">
            <Icon className="h-4 w-4 text-zinc-600" />
          </div>
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {tasks.map((task) => (
          <DailyTaskItem
            key={task.id}
            task={task}
            onComplete={onComplete}
            onClick={() => onTaskClick(task)}
            showDueDate={showDueDate}
          />
        ))}
      </CardContent>
    </Card>
  );
}

export default function DailyTasksPage() {
  const { success, error: toastError } = useToast();
  const { confirm, prompt } = useDialog();
  const { activeWorkspace, activeWorkspaceId } = useWorkspace();
  const [overdue, setOverdue] = useState([]);
  const [today, setToday] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [savedViews, setSavedViews] = useState([]);
  const [activeSavedViewId, setActiveSavedViewId] = useState('');
  const [isViewActionLoading, setIsViewActionLoading] = useState(false);
  const [savedViewsUnsupported, setSavedViewsUnsupported] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  const loadDailyTasks = useCallback(async () => {
    if (!activeWorkspaceId) {
      setOverdue([]);
      setToday([]);
      setUpcoming([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const params = { workspaceId: activeWorkspaceId };
      if (priorityFilter) params.priority = priorityFilter;
      const data = await taskService.getToday(params);
      setOverdue(data.overdue);
      setToday(data.today);
      setUpcoming(data.upcoming);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load daily tasks');
    } finally {
      setIsLoading(false);
    }
  }, [activeWorkspaceId, priorityFilter]);

  const loadSavedViews = useCallback(async () => {
    if (!activeWorkspaceId) {
      setSavedViews([]);
      setActiveSavedViewId('');
      return;
    }

    try {
      const data = await savedViewService.getAll({
        workspaceId: activeWorkspaceId,
        module: 'daily_tasks',
      });
      setSavedViews(data.views || []);
      setSavedViewsUnsupported(Boolean(data.unsupported));
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to load saved views');
    }
  }, [activeWorkspaceId, toastError]);

  useEffect(() => {
    loadDailyTasks();
  }, [loadDailyTasks]);

  useEffect(() => {
    loadSavedViews();
  }, [loadSavedViews]);

  useEffect(() => {
    setActiveSavedViewId('');
  }, [activeWorkspaceId]);

  const removeTask = (taskId) => {
    setOverdue((prev) => prev.filter((t) => t.id !== taskId));
    setToday((prev) => prev.filter((t) => t.id !== taskId));
    setUpcoming((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleComplete = async (taskId) => {
    await taskService.updateStatus(taskId, 'done');
    removeTask(taskId);
  };

  const handleQuickAdd = async (payload) => {
    const data = await taskService.create(payload);
    setToday((prev) => [data.task, ...prev]);
  };

  const handleTaskUpdated = (updated) => {
    if (updated.status === 'done') {
      removeTask(updated.id);
      return;
    }
    loadDailyTasks();
  };

  const handleTaskDeleted = (taskId) => {
    removeTask(taskId);
    setSelectedTaskId(null);
  };

  const onApplySavedView = (viewId) => {
    setActiveSavedViewId(viewId);
    if (!viewId) return;
    const selected = savedViews.find((item) => item.id === viewId);
    if (!selected) return;
    setPriorityFilter(selected.filters?.priority || '');
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
      module: 'daily_tasks',
      name: name.trim(),
      filters: {
        priority: priorityFilter,
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

  const totalCount = overdue.length + today.length + upcoming.length;
  const todayLabel = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="ml-2 mr-auto w-full max-w-[1400px] space-y-6 sm:ml-3">
      <div>
        <h1 className="text-lg font-semibold text-zinc-900">Daily Tasks</h1>
        <p className="mt-0.5 text-xs text-zinc-500">
          {activeWorkspace ? (
            <>
              {todayLabel} · {activeWorkspace.name}
            </>
          ) : (
            'Select a workspace to view your day'
          )}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick add</CardTitle>
          <CardDescription>Add a task due today in one step</CardDescription>
        </CardHeader>
        <CardContent>
          <QuickAddTask
            workspaceId={activeWorkspaceId}
            onCreated={handleQuickAdd}
            disabled={!activeWorkspaceId}
          />
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        <Select
          size="sm"
          className="w-full sm:w-[170px]"
          placeholder="Saved views"
          value={activeSavedViewId}
          onChange={(e) => onApplySavedView(e.target.value)}
          disabled={!activeWorkspaceId || savedViewsUnsupported}
          options={savedViews.map((item) => ({ value: item.id, label: item.name }))}
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
        <label htmlFor="priority-filter" className="text-sm text-zinc-600">
          Filter by priority
        </label>
        <Select
          id="priority-filter"
          size="sm"
          className="w-full sm:w-[160px]"
          placeholder="All priorities"
          value={priorityFilter}
          onChange={(e) => {
            setPriorityFilter(e.target.value);
            setActiveSavedViewId('');
          }}
          disabled={!activeWorkspaceId}
          options={TASK_PRIORITIES.map((p) => ({ value: p.value, label: p.label }))}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : totalCount === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CalendarDays className="mx-auto h-10 w-10 text-zinc-300" />
            <p className="mt-3 text-sm font-medium text-zinc-700">You&apos;re all caught up</p>
            <p className="mt-0.5 text-xs text-zinc-500">
              No overdue, today, or upcoming tasks. Use quick add above to plan your day.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <TaskSection
            title="Overdue"
            description={`${overdue.length} task${overdue.length !== 1 ? 's' : ''} past due`}
            icon={AlertCircle}
            tasks={overdue}
            onComplete={handleComplete}
            onTaskClick={(task) => setSelectedTaskId(task.id)}
            showDueDate
            accent="border-red-100"
          />
          <TaskSection
            title="Today"
            description={`${today.length} task${today.length !== 1 ? 's' : ''} due today`}
            icon={Sun}
            tasks={today}
            onComplete={handleComplete}
            onTaskClick={(task) => setSelectedTaskId(task.id)}
            showDueDate={false}
          />
          <TaskSection
            title="Upcoming"
            description={`${upcoming.length} task${upcoming.length !== 1 ? 's' : ''} scheduled ahead`}
            icon={Clock}
            tasks={upcoming}
            onComplete={handleComplete}
            onTaskClick={(task) => setSelectedTaskId(task.id)}
            showDueDate
          />
        </div>
      )}

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
