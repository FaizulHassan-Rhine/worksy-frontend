'use client';

import { useCallback, useEffect, useState } from 'react';
import { CheckSquare, LayoutGrid, List, Plus } from 'lucide-react';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import KanbanBoard from '@/components/task/KanbanBoard';
import TaskListView from '@/components/task/TaskListView';
import CreateTaskModal from '@/components/task/CreateTaskModal';
import TaskDrawer from '@/components/task/TaskDrawer';
import { TASK_STATUSES, TASK_PRIORITIES } from '@/constants/task';
import { useWorkspace } from '@/hooks/useWorkspace';
import taskService from '@/services/taskService';
import Select from '@/components/ui/Select';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';

export default function TasksPage() {
  const { success, error: toastError } = useToast();
  const { activeWorkspace, activeWorkspaceId } = useWorkspace();
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState('kanban');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
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

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

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

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
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
        <div className="flex flex-wrap gap-2">
          <Select
            size="sm"
            className="w-full min-w-0 sm:w-[160px]"
            placeholder="All statuses"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={TASK_STATUSES.map((s) => ({ value: s.value, label: s.label }))}
          />
          <Select
            size="sm"
            className="w-full min-w-0 sm:w-[160px]"
            placeholder="All priorities"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
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
