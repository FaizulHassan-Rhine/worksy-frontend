'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Label from '@/components/ui/Label';
import Select from '@/components/ui/Select';
import { TASK_STATUSES, TASK_PRIORITIES } from '@/constants/task';
import PendingAttachments from '@/components/files/PendingAttachments';
import workspaceService from '@/services/workspaceService';
import { uploadFilesToEntity } from '@/lib/files';

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(5000).optional(),
  status: z.enum(['todo', 'in-progress', 'review', 'done']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  dueDate: z.string().optional(),
  assignee: z.string().optional(),
});

export default function CreateTaskModal({
  open,
  onClose,
  workspaceId,
  projectId = null,
  onCreated,
}) {
  const [formError, setFormError] = useState('');
  const [members, setMembers] = useState([]);
  const [pendingFiles, setPendingFiles] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      dueDate: '',
      assignee: '',
    },
  });

  useEffect(() => {
    if (!open || !workspaceId) return;

    workspaceService
      .getMembers(workspaceId)
      .then((data) => setMembers(data.members || []))
      .catch(() => setMembers([]));
  }, [open, workspaceId]);

  const onSubmit = async (values) => {
    if (!workspaceId) {
      setFormError('No workspace selected');
      return;
    }

    setFormError('');
    try {
      const payload = {
        title: values.title,
        description: values.description || '',
        workspaceId,
        projectId,
        status: values.status,
        priority: values.priority,
        dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : null,
        assignee: values.assignee || null,
      };
      const result = await onCreated(payload);
      const taskId = result?.task?.id;

      if (pendingFiles.length && taskId) {
        await uploadFilesToEntity(pendingFiles, { workspaceId, projectId, taskId });
      }

      reset();
      setPendingFiles([]);
      onClose();
    } catch (error) {
      setFormError(error.response?.data?.message || 'Failed to create task');
    }
  };

  const handleClose = () => {
    reset();
    setFormError('');
    setPendingFiles([]);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Create task"
      description="Add a new task to your workspace."
      className="max-w-lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {formError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {formError}
          </div>
        )}

        <div>
          <Label htmlFor="title">Title</Label>
          <Input id="title" placeholder="Task title" error={errors.title} {...register('title')} />
          {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            rows={3}
            placeholder="Add details..."
            className="mt-1 flex w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300"
            {...register('description')}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              id="status"
              className="mt-1"
              value={watch('status')}
              options={TASK_STATUSES.map((s) => ({ value: s.value, label: s.label }))}
              {...register('status')}
            />
          </div>

          <div>
            <Label htmlFor="priority">Priority</Label>
            <Select
              id="priority"
              className="mt-1"
              value={watch('priority')}
              options={TASK_PRIORITIES.map((p) => ({ value: p.value, label: p.label }))}
              {...register('priority')}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="dueDate">Due date</Label>
            <Input id="dueDate" type="date" {...register('dueDate')} />
          </div>

          <div>
            <Label htmlFor="assignee">Assignee</Label>
            <Select
              id="assignee"
              className="mt-1"
              placeholder="Unassigned"
              value={watch('assignee') ?? ''}
              options={members.map((m) => ({ value: m.userId, label: m.name }))}
              {...register('assignee')}
            />
          </div>
        </div>

        <PendingAttachments
          files={pendingFiles}
          onChange={setPendingFiles}
          disabled={isSubmitting}
        />

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1" loading={isSubmitting}>
            Create task
          </Button>
        </div>
      </form>
    </Modal>
  );
}
