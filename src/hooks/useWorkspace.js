'use client';

import { useWorkspaceStore } from '@/store/workspaceStore';

export function useWorkspace() {
  const workspaces = useWorkspaceStore((state) => state.workspaces);
  const activeWorkspaceId = useWorkspaceStore((state) => state.activeWorkspaceId);
  const isLoading = useWorkspaceStore((state) => state.isLoading);
  const error = useWorkspaceStore((state) => state.error);
  const fetchWorkspaces = useWorkspaceStore((state) => state.fetchWorkspaces);
  const setActiveWorkspace = useWorkspaceStore((state) => state.setActiveWorkspace);
  const createWorkspace = useWorkspaceStore((state) => state.createWorkspace);
  const updateWorkspace = useWorkspaceStore((state) => state.updateWorkspace);
  const deleteWorkspace = useWorkspaceStore((state) => state.deleteWorkspace);
  const clearWorkspaces = useWorkspaceStore((state) => state.clearWorkspaces);
  const getActiveWorkspace = useWorkspaceStore((state) => state.getActiveWorkspace);

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId) || null;

  return {
    workspaces,
    activeWorkspace,
    activeWorkspaceId,
    isLoading,
    error,
    fetchWorkspaces,
    setActiveWorkspace,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    clearWorkspaces,
    getActiveWorkspace,
  };
}
