export const NOTE_TYPES = [
  { value: 'personal', label: 'Personal', description: 'Private notes only you can see' },
  { value: 'project', label: 'Project', description: 'Linked to a specific project' },
  { value: 'workspace', label: 'Workspace', description: 'Shared with workspace members' },
];

export const getNoteTypeLabel = (value) =>
  NOTE_TYPES.find((t) => t.value === value)?.label || value;

export const getNoteTypeColor = (value) => {
  const colors = {
    personal: 'bg-violet-50 text-violet-700 border-violet-100',
    project: 'bg-blue-50 text-blue-700 border-blue-100',
    workspace: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  };
  return colors[value] || 'bg-zinc-100 text-zinc-600 border-zinc-200';
};

export const getContentPreview = (content, maxLength = 120) => {
  if (!content) return 'No content';
  const plain = content.replace(/[#*`_~\[\]]/g, '').trim();
  if (plain.length <= maxLength) return plain;
  return `${plain.slice(0, maxLength)}...`;
};
