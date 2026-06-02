'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Trash2 } from 'lucide-react';
import Drawer from '@/components/ui/Drawer';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Label from '@/components/ui/Label';
import Select from '@/components/ui/Select';
import Spinner from '@/components/ui/Spinner';
import { TASK_STATUSES, TASK_PRIORITIES, getStatusColor, getStatusLabel } from '@/constants/task';
import taskService from '@/services/taskService';
import { useToast } from '@/hooks/useToast';
import workspaceService from '@/services/workspaceService';
import FileAttachments from '@/components/files/FileAttachments';
import { cn } from '@/lib/utils';
import { useDialog } from '@/hooks/useDialog';

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(5000).optional(),
  status: z.enum(['todo', 'in-progress', 'review', 'done']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  dueDate: z.string().optional(),
  assignee: z.string().optional(),
});

export default function TaskDrawer({ taskId, open, onClose, workspaceId, onUpdated, onDeleted }) {
  const { success, error: toastError } = useToast();
  const { confirm } = useDialog();
  const [task, setTask] = useState(null);
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (!open || !taskId) return;

    const load = async () => {
      setIsLoading(true);
      setError('');
      try {
        const [taskData, membersData] = await Promise.all([
          taskService.getById(taskId),
          workspaceId ? workspaceService.getMembers(workspaceId) : Promise.resolve({ members: [] }),
        ]);
        setTask(taskData.task);
        setMembers(membersData.members || []);
        reset({
          title: taskData.task.title,
          description: taskData.task.description || '',
          status: taskData.task.status,
          priority: taskData.task.priority,
          dueDate: taskData.task.dueDate
            ? new Date(taskData.task.dueDate).toISOString().split('T')[0]
            : '',
          assignee: taskData.task.assignee?.id || '',
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load task');
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [open, taskId, workspaceId, reset]);

  const onSave = async (values) => {
    setError('');
    setMessage('');
    try {
      const payload = {
        title: values.title,
        description: values.description || '',
        status: values.status,
        priority: values.priority,
        dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : null,
        assignee: values.assignee || null,
      };
      const data = await taskService.update(taskId, payload);
      setTask(data.task);
      setMessage('Task saved');
      onUpdated?.(data.task);
      success('Task updated');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save task';
      setError(msg);
      toastError(msg);
    }
  };

  const onDelete = async () => {
    const confirmed = await confirm({
      title: 'Delete task',
      description: `Delete "${task?.title}"?`,
      confirmText: 'Delete',
    });
    if (!confirmed) return;

    try {
      await taskService.delete(taskId);
      onDeleted?.(taskId);
      onClose();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to delete task');
    }
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={task?.title || 'Task details'}
      description={task ? getStatusLabel(task.status) : 'View and edit task'}
    >
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : error && !task ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSave)} className="space-y-5">
          {message && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {message}
            </div>
          )}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {task && (
            <span
              className={cn(
                'inline-flex rounded-lg border px-2.5 py-1 text-xs font-medium',
                getStatusColor(task.status)
              )}
            >
              {getStatusLabel(task.status)}
            </span>
          )}

          <div>
            <Label htmlFor="drawer-title">Title</Label>
            <Input id="drawer-title" error={errors.title} {...register('title')} />
            {errors.title && (
              <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="drawer-description">Description</Label>
            <textarea
              id="drawer-description"
              rows={5}
              className="mt-1 flex w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300"
              {...register('description')}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="drawer-status">Status</Label>
              <Select
                id="drawer-status"
                className="mt-1"
                value={watch('status')}
                options={TASK_STATUSES.map((s) => ({ value: s.value, label: s.label }))}
                {...register('status')}
              />
            </div>

            <div>
              <Label htmlFor="drawer-priority">Priority</Label>
              <Select
                id="drawer-priority"
                className="mt-1"
                value={watch('priority')}
                options={TASK_PRIORITIES.map((p) => ({ value: p.value, label: p.label }))}
                {...register('priority')}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="drawer-dueDate">Due date</Label>
              <Input id="drawer-dueDate" type="date" {...register('dueDate')} />
            </div>

            <div>
              <Label htmlFor="drawer-assignee">Assignee</Label>
              <Select
                id="drawer-assignee"
                className="mt-1"
                placeholder="Unassigned"
                value={watch('assignee') ?? ''}
                options={members.map((m) => ({ value: m.userId, label: m.name }))}
                {...register('assignee')}
              />
            </div>
          </div>

          {workspaceId && taskId && (
            <div className="border-t border-zinc-100 pt-5">
              <FileAttachments
                workspaceId={workspaceId}
                taskId={taskId}
                title="Attachments"
                compact
              />
            </div>
          )}


          <div className="flex flex-col gap-3 border-t border-zinc-100 pt-5 sm:flex-row sm:items-center">
            <Button
              type="button"
              variant="ghost"
              className="text-red-600 hover:bg-red-50 sm:mr-auto"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-1 sm:justify-end">
              <Button type="button" variant="secondary" className="sm:flex-1 sm:max-w-[140px]" onClick={onClose}>
                Close
              </Button>
              <Button type="submit" className="sm:flex-1 sm:max-w-[140px]" loading={isSubmitting}>
                Save
              </Button>
            </div>
          </div>
        </form>
      )}
    </Drawer>
  );
}
