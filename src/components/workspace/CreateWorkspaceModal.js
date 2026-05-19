'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Label from '@/components/ui/Label';
import { useWorkspace } from '@/hooks/useWorkspace';

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  type: z.enum(['team']),
});

export default function CreateWorkspaceModal({ open, onClose }) {
  const { createWorkspace } = useWorkspace();
  const [formError, setFormError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', type: 'team' },
  });

  const onSubmit = async (values) => {
    setFormError('');
    try {
      await createWorkspace(values);
      reset();
      onClose();
    } catch (error) {
      setFormError(error.response?.data?.message || 'Failed to create workspace');
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
      title="Create team workspace"
      description="Collaborate with your team in a shared workspace."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {formError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {formError}
          </div>
        )}

        <div>
          <Label htmlFor="workspace-name">Workspace name</Label>
          <Input
            id="workspace-name"
            placeholder="Acme Team"
            error={errors.name}
            {...register('name')}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
          )}
        </div>

        <input type="hidden" {...register('type')} value="team" />

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1" loading={isSubmitting}>
            Create workspace
          </Button>
        </div>
      </form>
    </Modal>
  );
}
