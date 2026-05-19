export const PROJECT_STATUSES = [
  { value: 'planning', label: 'Planning' },
  { value: 'active', label: 'Active' },
  { value: 'on_hold', label: 'On hold' },
  { value: 'completed', label: 'Completed' },
];

export const PROJECT_COLORS = [
  { value: 'zinc', label: 'Gray', class: 'bg-zinc-500' },
  { value: 'blue', label: 'Blue', class: 'bg-blue-500' },
  { value: 'violet', label: 'Violet', class: 'bg-violet-500' },
  { value: 'emerald', label: 'Green', class: 'bg-emerald-500' },
  { value: 'amber', label: 'Amber', class: 'bg-amber-500' },
  { value: 'rose', label: 'Rose', class: 'bg-rose-500' },
];

export const PROJECT_ICONS = [
  'folder-kanban',
  'rocket',
  'target',
  'briefcase',
  'code',
  'palette',
  'zap',
  'star',
];

export const getStatusLabel = (status) =>
  PROJECT_STATUSES.find((s) => s.value === status)?.label || status;

export const getColorClass = (color) =>
  PROJECT_COLORS.find((c) => c.value === color)?.class || 'bg-blue-500';
