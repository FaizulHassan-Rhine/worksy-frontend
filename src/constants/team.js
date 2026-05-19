export const MEMBER_ROLES = [
  { value: 'owner', label: 'Owner', description: 'Full control of the workspace' },
  { value: 'admin', label: 'Admin', description: 'Manage members and settings' },
  { value: 'member', label: 'Member', description: 'Create and edit content' },
  { value: 'viewer', label: 'Viewer', description: 'View-only access' },
];

export const INVITE_ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'member', label: 'Member' },
  { value: 'viewer', label: 'Viewer' },
];

export const getRoleLabel = (value) =>
  MEMBER_ROLES.find((r) => r.value === value)?.label || value;

export const getRoleColor = (value) => {
  const colors = {
    owner: 'bg-zinc-900 text-white border-zinc-900',
    admin: 'bg-violet-50 text-violet-700 border-violet-100',
    member: 'bg-blue-50 text-blue-700 border-blue-100',
    viewer: 'bg-zinc-100 text-zinc-600 border-zinc-200',
  };
  return colors[value] || colors.member;
};

export const getInviteRolesForActor = (actorRole) => {
  if (actorRole === 'owner') return INVITE_ROLES;
  if (actorRole === 'admin') return INVITE_ROLES.filter((r) => r.value !== 'admin');
  return [];
};

export const getEditableRolesForActor = (actorRole, targetRole, isOwner) => {
  if (isOwner) return [];
  if (actorRole === 'owner') {
    return INVITE_ROLES;
  }
  if (actorRole === 'admin' && (targetRole === 'member' || targetRole === 'viewer')) {
    return INVITE_ROLES.filter((r) => r.value === 'member' || r.value === 'viewer');
  }
  return [];
};
