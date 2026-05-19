'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Label from '@/components/ui/Label';
import Badge from '@/components/ui/Badge';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useAuth } from '@/hooks/useAuth';

const renameSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
});

export default function SettingsPage() {
  const { user } = useAuth();
  const { activeWorkspace, updateWorkspace, deleteWorkspace } = useWorkspace();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(renameSchema),
    values: { name: activeWorkspace?.name || '' },
  });

  const onRename = async (values) => {
    if (!activeWorkspace) return;
    setMessage('');
    setError('');
    try {
      await updateWorkspace(activeWorkspace.id, values);
      setMessage('Workspace updated successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update workspace');
    }
  };

  const onDelete = async () => {
    if (!activeWorkspace || activeWorkspace.type === 'personal') return;

    const confirmed = window.confirm(
      `Delete "${activeWorkspace.name}"? This cannot be undone.`
    );
    if (!confirmed) return;

    setMessage('');
    setError('');
    try {
      await deleteWorkspace(activeWorkspace.id);
      setMessage('Workspace deleted');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete workspace');
    }
  };

  if (!activeWorkspace) {
    return (
      <div className="mx-auto max-w-2xl">
        <p className="text-sm text-zinc-500">No workspace selected.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-zinc-900">Settings</h1>
        <p className="mt-0.5 text-xs text-zinc-500">Manage your account and workspace</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Your profile information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="text-zinc-500">Name:</span>{' '}
            <span className="font-medium text-zinc-900">{user?.name}</span>
          </p>
          <p>
            <span className="text-zinc-500">Email:</span>{' '}
            <span className="font-medium text-zinc-900">{user?.email}</span>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Active workspace</CardTitle>
            <Badge variant={activeWorkspace.type}>{activeWorkspace.type}</Badge>
          </div>
          <CardDescription>Rename or manage the current workspace</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onRename)} className="space-y-4">
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

            <div>
              <Label htmlFor="workspace-name">Workspace name</Label>
              <Input id="workspace-name" error={errors.name} {...register('name')} />
              {errors.name && (
                <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
              )}
              <p className="mt-1.5 text-xs text-zinc-400">Slug: {activeWorkspace.slug}</p>
            </div>

            <Button type="submit" loading={isSubmitting}>
              Save changes
            </Button>
          </form>

          {activeWorkspace.type === 'team' && (
            <div className="mt-6 border-t border-zinc-100 pt-6">
              <h4 className="text-sm font-medium text-red-600">Danger zone</h4>
              <p className="mt-0.5 text-xs text-zinc-500">
                Permanently delete this team workspace and all its data.
              </p>
              <Button
                type="button"
                variant="secondary"
                className="mt-3 border-red-200 text-red-600 hover:bg-red-50"
                onClick={onDelete}
              >
                <Trash2 className="h-4 w-4" />
                Delete workspace
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
