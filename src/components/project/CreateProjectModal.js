'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Label from '@/components/ui/Label';
import Select from '@/components/ui/Select';
import { PROJECT_STATUSES, PROJECT_COLORS, PROJECT_ICONS } from '@/constants/project';
import PendingAttachments from '@/components/files/PendingAttachments';
import ProjectIcon from './ProjectIcon';
import { uploadFilesToEntity } from '@/lib/files';
import { cn } from '@/lib/utils';

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(150),
  description: z.string().max(2000).optional(),
  status: z.enum(['planning', 'active', 'on_hold', 'completed']),
  color: z.enum(['zinc', 'blue', 'violet', 'emerald', 'amber', 'rose']),
  icon: z.string(),
});

export default function CreateProjectModal({ open, onClose, workspaceId, onCreated }) {
  const [formError, setFormError] = useState('');
  const [pendingFiles, setPendingFiles] = useState([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      status: 'planning',
      color: 'blue',
      icon: 'folder-kanban',
    },
  });

  const selectedColor = watch('color');
  const selectedIcon = watch('icon');

  const onSubmit = async (values) => {
    if (!workspaceId) {
      setFormError('No workspace selected');
      return;
    }

    setFormError('');
    try {
      const result = await onCreated({ ...values, workspaceId });
      const projectId = result?.project?.id;

      if (pendingFiles.length && projectId) {
        await uploadFilesToEntity(pendingFiles, { workspaceId, projectId });
      }

      reset();
      setPendingFiles([]);
      onClose();
    } catch (error) {
      setFormError(error.response?.data?.message || 'Failed to create project');
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
      title="Create project"
      description="Add a new project to organize your tasks."
      className="max-w-lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {formError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {formError}
          </div>
        )}

        <div className="flex items-center gap-4">
          <ProjectIcon icon={selectedIcon} color={selectedColor} size="lg" />
          <div className="flex-1">
            <Label htmlFor="title">Project title</Label>
            <Input id="title" placeholder="Website redesign" error={errors.title} {...register('title')} />
            {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            rows={3}
            placeholder="What is this project about?"
            className="flex w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300"
            {...register('description')}
          />
        </div>

        <div>
          <Label>Color</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {PROJECT_COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setValue('color', c.value)}
                className={cn(
                  'h-8 w-8 rounded-full border-2 transition-all',
                  c.class,
                  selectedColor === c.value ? 'border-zinc-900 scale-110' : 'border-transparent'
                )}
                title={c.label}
              />
            ))}
          </div>
        </div>

        <div>
          <Label>Icon</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {PROJECT_ICONS.map((iconName) => (
              <button
                key={iconName}
                type="button"
                onClick={() => setValue('icon', iconName)}
                className={cn(
                  'rounded-xl border p-2 transition-all',
                  selectedIcon === iconName
                    ? 'border-zinc-900 bg-zinc-50'
                    : 'border-zinc-200 hover:border-zinc-300'
                )}
              >
                <ProjectIcon icon={iconName} color={selectedColor} size="sm" />
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <Select
            id="status"
            className="mt-1"
            value={watch('status')}
            options={PROJECT_STATUSES.map((s) => ({ value: s.value, label: s.label }))}
            {...register('status')}
          />
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
            Create project
          </Button>
        </div>
      </form>
    </Modal>
  );
}
