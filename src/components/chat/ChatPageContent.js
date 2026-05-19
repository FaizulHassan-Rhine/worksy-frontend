'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Hash, Menu, MessageSquare } from 'lucide-react';
import ChatPanel from '@/components/chat/ChatPanel';
import Spinner from '@/components/ui/Spinner';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspace } from '@/hooks/useWorkspace';
import projectService from '@/services/projectService';
import workspaceService from '@/services/workspaceService';
import { cn } from '@/lib/utils';

function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function ChatPageContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { activeWorkspace, activeWorkspaceId } = useWorkspace();
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(true);
  const [channel, setChannel] = useState('workspace');
  const [recipientId, setRecipientId] = useState(null);
  const [mobileListOpen, setMobileListOpen] = useState(false);

  const projectId = channel === 'workspace' ? null : channel;
  const isDm = Boolean(recipientId);

  const selectChannel = (id) => {
    setChannel(id);
    setRecipientId(null);
    setMobileListOpen(false);
  };

  const selectMember = (userId) => {
    setRecipientId(userId);
    setMobileListOpen(false);
  };

  useEffect(() => {
    const projectParam = searchParams.get('project');
    if (projectParam) {
      setChannel(projectParam);
      setRecipientId(null);
    }
  }, [searchParams]);

  const loadProjects = useCallback(async () => {
    if (!activeWorkspaceId) {
      setProjects([]);
      setProjectsLoading(false);
      return;
    }

    setProjectsLoading(true);
    try {
      const data = await projectService.getAll(activeWorkspaceId);
      setProjects(data.projects || []);
    } catch {
      setProjects([]);
    } finally {
      setProjectsLoading(false);
    }
  }, [activeWorkspaceId]);

  const loadMembers = useCallback(async () => {
    if (!activeWorkspaceId) {
      setMembers([]);
      setMembersLoading(false);
      return;
    }

    setMembersLoading(true);
    try {
      const data = await workspaceService.getMembers(activeWorkspaceId);
      setMembers(data.members || []);
    } catch {
      setMembers([]);
    } finally {
      setMembersLoading(false);
    }
  }, [activeWorkspaceId]);

  useEffect(() => {
    loadProjects();
    loadMembers();
  }, [loadProjects, loadMembers]);

  const otherMembers = members.filter(
    (m) => user?.id && String(m.userId) !== String(user.id)
  );

  const selectedMember = recipientId
    ? members.find((m) => String(m.userId) === String(recipientId))
    : null;

  const selectedProject =
    channel !== 'workspace' ? projects.find((p) => p.id === channel) : null;

  const panelTitle = isDm
    ? selectedMember?.name || 'Direct message'
    : selectedProject
      ? selectedProject.title
      : activeWorkspace?.name || 'Workspace';

  const panelSubtitle = isDm
    ? projectId
      ? `Private · ${selectedProject?.title || 'Project'}`
      : 'Private · Workspace'
    : selectedProject
      ? 'Project channel'
      : 'Everyone in this workspace';

  const channelList = (
  <>
      <div className="border-b border-zinc-200/80 px-3 py-2.5 dark:border-zinc-800">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Channels</p>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <button
          type="button"
          onClick={() => selectChannel('workspace')}
          className={cn(
            'flex w-full items-center gap-2 rounded-lg px-2.5 py-2.5 text-left text-xs font-medium transition-colors',
            !isDm && channel === 'workspace'
              ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50'
              : 'text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800/50'
          )}
        >
          <Hash className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{activeWorkspace?.name || 'Workspace'}</span>
        </button>

        {projectsLoading ? (
          <div className="flex justify-center py-3">
            <Spinner size="sm" />
          </div>
        ) : (
          projects.map((project) => (
            <button
              key={project.id}
              type="button"
              onClick={() => selectChannel(project.id)}
              className={cn(
                'flex w-full items-center gap-2 rounded-lg px-2.5 py-2.5 text-left text-xs font-medium transition-colors',
                !isDm && channel === project.id
                  ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50'
                  : 'text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800/50'
              )}
            >
              <Hash className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{project.title}</span>
            </button>
          ))
        )}

        <div className="my-2 border-t border-zinc-200/80 dark:border-zinc-800" />

        <p className="px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
          Direct messages
        </p>

        {membersLoading ? (
          <div className="flex justify-center py-3">
            <Spinner size="sm" />
          </div>
        ) : otherMembers.length === 0 ? (
          <p className="px-2.5 py-2 text-[11px] text-zinc-400">
            Invite team members to start private chats.
          </p>
        ) : (
          otherMembers.map((member) => (
            <button
              key={member.userId}
              type="button"
              onClick={() => selectMember(member.userId)}
              className={cn(
                'flex w-full items-center gap-2 rounded-lg px-2.5 py-2.5 text-left text-xs font-medium transition-colors',
                isDm && String(recipientId) === String(member.userId)
                  ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50'
                  : 'text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800/50'
              )}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-[10px] font-semibold text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200">
                {getInitials(member.name)}
              </span>
              <span className="truncate">{member.name}</span>
            </button>
          ))
        )}
      </div>
    </>
  );

  if (!activeWorkspaceId) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <MessageSquare className="h-8 w-8 text-zinc-300 dark:text-zinc-600" />
        <p className="mt-3 text-sm font-medium text-zinc-900 dark:text-zinc-50">
          Select a workspace
        </p>
        <p className="mt-1 text-xs text-zinc-500">Use the sidebar to open team chat</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col min-h-app lg:min-h-[calc(100vh-7rem)]">
      <div className="mb-3 shrink-0 sm:mb-4">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Messages</h1>
        <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
          Channels and direct messages
        </p>
      </div>

      <button
        type="button"
        onClick={() => setMobileListOpen(true)}
        className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200/80 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 lg:hidden dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
      >
        <Menu className="h-4 w-4" />
        Browse channels & DMs
      </button>

      <div className="relative flex min-h-0 flex-1 flex-col gap-0 lg:flex-row lg:gap-4">
        {mobileListOpen && (
          <button
            type="button"
            aria-label="Close channel list"
            className="fixed inset-0 z-40 bg-zinc-900/40 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileListOpen(false)}
          />
        )}

        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-50 flex w-[min(100vw-3rem,18rem)] flex-col overflow-hidden rounded-r-xl border border-zinc-200/80 bg-white shadow-xl transition-transform duration-300 dark:border-zinc-800 dark:bg-zinc-900 lg:static lg:z-auto lg:w-56 lg:shrink-0 lg:rounded-xl lg:shadow-none',
            mobileListOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          )}
        >
          {channelList}
        </aside>

        <ChatPanel
          className="min-h-[min(70dvh,560px)] min-w-0 flex-1 lg:min-h-0"
          workspaceId={activeWorkspaceId}
          projectId={projectId}
          recipientId={recipientId}
          title={panelTitle}
          subtitle={panelSubtitle}
          showHeader
        />
      </div>
    </div>
  );
}
