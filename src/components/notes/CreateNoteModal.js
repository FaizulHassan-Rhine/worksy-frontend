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
import { NOTE_TYPES } from '@/constants/note';
import projectService from '@/services/projectService';

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  type: z.enum(['personal', 'project', 'workspace']),
  projectId: z.string().optional(),
  isPrivate: z.boolean().optional(),
});

export default function CreateNoteModal({
  open,
  onClose,
  workspaceId,
  defaultType = 'personal',
  defaultProjectId = null,
  onCreated,
}) {
  const [formError, setFormError] = useState('');
  const [projects, setProjects] = useState([]);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      type: defaultType,
      projectId: defaultProjectId || '',
      isPrivate: defaultType === 'personal',
    },
  });

  const noteType = watch('type');

  useEffect(() => {
    if (!open || !workspaceId) return;
    projectService
      .getAll(workspaceId)
      .then((data) => setProjects(data.projects || []))
      .catch(() => setProjects([]));
  }, [open, workspaceId]);

  useEffect(() => {
    if (open) {
      reset({
        title: '',
        type: defaultType,
        projectId: defaultProjectId || '',
        isPrivate: defaultType === 'personal',
      });
    }
  }, [open, defaultType, defaultProjectId, reset]);

  useEffect(() => {
    if (noteType === 'personal') {
      setValue('isPrivate', true);
      setValue('projectId', '');
    } else if (noteType === 'workspace') {
      setValue('isPrivate', false);
      setValue('projectId', '');
    } else if (noteType === 'project') {
      setValue('isPrivate', false);
    }
  }, [noteType, setValue]);

  const onSubmit = async (values) => {
    if (!workspaceId) {
      setFormError('No workspace selected');
      return;
    }

    if (values.type === 'project' && !values.projectId) {
      setFormError('Please select a project');
      return;
    }

    setFormError('');
    try {
      await onCreated({
        title: values.title,
        workspaceId,
        type: values.type,
        projectId: values.type === 'project' ? values.projectId : null,
        isPrivate: values.isPrivate,
        content: '',
      });
      reset();
      onClose();
    } catch (error) {
      setFormError(error.response?.data?.message || 'Failed to create note');
    }
  };

  const handleClose = () => {
    reset();
    setFormError('');
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Create note"
      description="Add a personal, project, or workspace note."
      className="max-w-lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {formError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {formError}
          </div>
        )}

        <div>
          <Label htmlFor="note-title">Title</Label>
          <Input id="note-title" placeholder="Note title" error={errors.title} {...register('title')} />
          {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
        </div>

        <div>
          <Label htmlFor="note-type">Type</Label>
          <Select
            id="note-type"
            className="mt-1"
            value={watch('type')}
            disabled={Boolean(defaultProjectId)}
            options={NOTE_TYPES.map((t) => ({ value: t.value, label: t.label }))}
            {...register('type')}
          />
          <p className="mt-1 text-xs text-zinc-400">
            {NOTE_TYPES.find((t) => t.value === noteType)?.description}
          </p>
        </div>

        {noteType === 'project' && (
          <div>
            <Label htmlFor="note-project">Project</Label>
            <Select
              id="note-project"
              className="mt-1"
              placeholder="Select project"
              value={watch('projectId') ?? ''}
              disabled={Boolean(defaultProjectId)}
              options={projects.map((p) => ({ value: p.id, label: p.title }))}
              {...register('projectId')}
            />
          </div>
        )}

        {noteType === 'personal' && (
          <label className="flex items-center gap-2 text-sm text-zinc-600">
            <input type="checkbox" className="rounded border-zinc-300" {...register('isPrivate')} />
            Keep this note private
          </label>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1" loading={isSubmitting}>
            Create note
          </Button>
        </div>
      </form>
    </Modal>
  );
}
