'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { TASK_PRIORITIES } from '@/constants/task';

export default function QuickAddTask({ workspaceId, onCreated, disabled }) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed || !workspaceId) return;

    setIsSubmitting(true);
    setError('');
    try {
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      await onCreated({
        title: trimmed,
        workspaceId,
        priority,
        dueDate: endOfDay.toISOString(),
        status: 'todo',
      });
      setTitle('');
      setPriority('medium');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add task');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
          {error}
        </div>
      )}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Quick add a task for today..."
          disabled={disabled || isSubmitting}
          className="flex-1"
        />
        <Select
          className="sm:w-36"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          disabled={disabled || isSubmitting}
          options={TASK_PRIORITIES.map((p) => ({ value: p.value, label: p.label }))}
        />
        <Button type="submit" loading={isSubmitting} disabled={disabled || !title.trim()}>
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>
    </form>
  );
}
