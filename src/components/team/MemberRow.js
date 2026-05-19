'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { getEditableRolesForActor, getRoleColor, getRoleLabel } from '@/constants/team';
import Select from '@/components/ui/Select';
import { cn } from '@/lib/utils';

export default function MemberRow({
  member,
  actorRole,
  currentUserId,
  onRoleChange,
  onRemove,
}) {
  const [role, setRole] = useState(member.role);
  const [isUpdating, setIsUpdating] = useState(false);

  const editableRoles = getEditableRolesForActor(actorRole, member.role, member.isOwner);
  const canEdit = editableRoles.length > 0 && member.userId !== currentUserId;
  const canRemove = canEdit && !member.isOwner;

  const handleRoleChange = async (newRole) => {
    setRole(newRole);
    setIsUpdating(true);
    try {
      await onRoleChange(member.id, newRole);
    } catch {
      setRole(member.role);
    } finally {
      setIsUpdating(false);
    }
  };

  const initials = member.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-sm font-medium text-white">
          {member.avatar ? (
            <img src={member.avatar} alt="" className="h-10 w-10 rounded-xl object-cover" />
          ) : (
            initials || '?'
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-zinc-900">{member.name}</p>
          <p className="truncate text-xs text-zinc-500">{member.email}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:shrink-0">
        {canEdit ? (
          <Select
            size="sm"
            className="w-full sm:w-[140px]"
            value={role}
            disabled={isUpdating}
            onChange={(e) => handleRoleChange(e.target.value)}
            options={
              member.isOwner
                ? [{ value: 'owner', label: 'Owner' }]
                : editableRoles.map((r) => ({ value: r.value, label: r.label }))
            }
          />
        ) : (
          <span
            className={cn(
              'rounded-lg border px-2.5 py-1 text-xs font-medium',
              getRoleColor(member.role)
            )}
          >
            {getRoleLabel(member.role)}
          </span>
        )}

        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-red-600 hover:bg-red-50"
            onClick={() => onRemove(member.id)}
            title="Remove member"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
