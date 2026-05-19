'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus, UserPlus, Users } from 'lucide-react';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import MemberRow from '@/components/team/MemberRow';
import InviteMemberModal from '@/components/team/InviteMemberModal';
import CreateWorkspaceModal from '@/components/workspace/CreateWorkspaceModal';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useAuth } from '@/hooks/useAuth';
import workspaceService from '@/services/workspaceService';
import { useToast } from '@/hooks/useToast';

export default function TeamPage() {
  const { success, error: toastError } = useToast();
  const { user } = useAuth();
  const { activeWorkspace, activeWorkspaceId } = useWorkspace();
  const [members, setMembers] = useState([]);
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [canManage, setCanManage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [createWorkspaceOpen, setCreateWorkspaceOpen] = useState(false);

  const isTeamWorkspace = activeWorkspace?.type === 'team';

  const loadMembers = useCallback(async () => {
    if (!activeWorkspaceId || !isTeamWorkspace) {
      setMembers([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const data = await workspaceService.getMembers(activeWorkspaceId);
      setMembers(data.members);
      setCurrentUserRole(data.currentUserRole);
      setCanManage(data.canManage);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load team members');
    } finally {
      setIsLoading(false);
    }
  }, [activeWorkspaceId, isTeamWorkspace]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const handleInvite = async (payload) => {
    try {
      const data = await workspaceService.inviteMember(activeWorkspaceId, payload);
      setMembers(data.members);
      success('Member invited');
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to invite member');
      throw err;
    }
  };

  const handleRoleChange = async (memberId, role) => {
    try {
      const data = await workspaceService.updateMemberRole(activeWorkspaceId, memberId, role);
      setMembers(data.members);
      success('Role updated');
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to update role');
    }
  };

  const handleRemove = async (memberId) => {
    const confirmed = window.confirm('Remove this member from the workspace?');
    if (!confirmed) return;

    try {
      const data = await workspaceService.removeMember(activeWorkspaceId, memberId);
      setMembers(data.members);
      success('Member removed');
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to remove member');
    }
  };

  if (!activeWorkspace) {
    return (
      <div className="mx-auto max-w-3xl">
        <EmptyState
          icon={Users}
          title="No workspace selected"
          description="Select or create a workspace to manage your team."
        />
      </div>
    );
  }

  if (!isTeamWorkspace) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-lg font-semibold text-zinc-900">Team</h1>
          <p className="mt-0.5 text-xs text-zinc-500">
            Team management is available for team workspaces only.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Create a team workspace</CardTitle>
            <CardDescription>
              Personal workspaces are just for you. Create a team workspace to invite members and
              collaborate.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setCreateWorkspaceOpen(true)}>
              <Plus className="h-4 w-4" />
              Create team workspace
            </Button>
          </CardContent>
        </Card>

        <CreateWorkspaceModal
          open={createWorkspaceOpen}
          onClose={() => setCreateWorkspaceOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-zinc-900">Team</h1>
          <p className="mt-0.5 text-xs text-zinc-500">
            Manage members in {activeWorkspace.name}
            {currentUserRole && (
              <span className="ml-1 text-zinc-400">· You are {currentUserRole}</span>
            )}
          </p>
        </div>
        {canManage && (
          <Button onClick={() => setInviteOpen(true)}>
            <UserPlus className="h-4 w-4" />
            Invite member
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : members.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No members yet"
          description="Invite teammates by email to start collaborating."
          action={
            canManage ? (
              <Button onClick={() => setInviteOpen(true)}>
                <UserPlus className="h-4 w-4" />
                Invite member
              </Button>
            ) : null
          }
        />
      ) : (
        <div className="space-y-3">
          {members.map((member) => (
            <MemberRow
              key={member.id}
              member={member}
              actorRole={currentUserRole}
              currentUserId={user?.id}
              onRoleChange={handleRoleChange}
              onRemove={handleRemove}
            />
          ))}
        </div>
      )}

      <InviteMemberModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        actorRole={currentUserRole}
        onInvited={handleInvite}
      />
    </div>
  );
}
