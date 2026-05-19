'use client';

import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, CalendarDays, Clock, Sun } from 'lucide-react';
import Spinner from '@/components/ui/Spinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import DailyTaskItem from '@/components/daily/DailyTaskItem';
import QuickAddTask from '@/components/daily/QuickAddTask';
import Select from '@/components/ui/Select';
import TaskDrawer from '@/components/task/TaskDrawer';
import { TASK_PRIORITIES } from '@/constants/task';
import { useWorkspace } from '@/hooks/useWorkspace';
import taskService from '@/services/taskService';
import { cn } from '@/lib/utils';

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
  const { activeWorkspace, activeWorkspaceId } = useWorkspace();
  const [overdue, setOverdue] = useState([]);
  const [today, setToday] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
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

  useEffect(() => {
    loadDailyTasks();
  }, [loadDailyTasks]);

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

  const totalCount = overdue.length + today.length + upcoming.length;
  const todayLabel = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
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
        <label htmlFor="priority-filter" className="text-sm text-zinc-600">
          Filter by priority
        </label>
        <Select
          id="priority-filter"
          size="sm"
          className="w-full sm:w-[160px]"
          placeholder="All priorities"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
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
