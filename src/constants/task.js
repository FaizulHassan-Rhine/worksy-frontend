export const TASK_STATUSES = [
  { value: 'todo', label: 'To Do', color: 'bg-zinc-100 text-zinc-700 border-zinc-200' },
  {
    value: 'in-progress',
    label: 'In Progress',
    color: 'bg-blue-50 text-blue-700 border-blue-100',
  },
  { value: 'review', label: 'Review', color: 'bg-amber-50 text-amber-700 border-amber-100' },
  { value: 'done', label: 'Done', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
];

export const TASK_PRIORITIES = [
  { value: 'low', label: 'Low', color: 'bg-zinc-100 text-zinc-600' },
  { value: 'medium', label: 'Medium', color: 'bg-blue-50 text-blue-700' },
  { value: 'high', label: 'High', color: 'bg-amber-50 text-amber-700' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-50 text-red-700' },
];

export const getStatusLabel = (value) =>
  TASK_STATUSES.find((s) => s.value === value)?.label || value;

export const getStatusColor = (value) =>
  TASK_STATUSES.find((s) => s.value === value)?.color || 'bg-zinc-100 text-zinc-600';

export const getPriorityLabel = (value) =>
  TASK_PRIORITIES.find((p) => p.value === value)?.label || value;

export const getPriorityColor = (value) =>
  TASK_PRIORITIES.find((p) => p.value === value)?.color || 'bg-zinc-100 text-zinc-600';

export const formatDueDate = (date) => {
  if (!date) return null;
  return new Date(date).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const isOverdue = (dueDate, status) => {
  if (!dueDate || status === 'done') return false;
  const due = new Date(dueDate);
  due.setHours(23, 59, 59, 999);
  return due < new Date();
};
