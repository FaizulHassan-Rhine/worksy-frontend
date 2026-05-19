'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '@/constants/branding';
import workspaceService from '@/services/workspaceService';

export const useWorkspaceStore = create(
  persist(
    (set, get) => ({
      workspaces: [],
      activeWorkspaceId: null,
      isLoading: false,
      error: null,

      setWorkspaces: (workspaces) => {
        const { activeWorkspaceId } = get();
        const hasActive = workspaces.some((w) => w.id === activeWorkspaceId);

        set({
          workspaces,
          activeWorkspaceId: hasActive
            ? activeWorkspaceId
            : workspaces[0]?.id || null,
        });
      },

      setActiveWorkspace: (workspaceId) => {
        set({ activeWorkspaceId: workspaceId });
      },

      fetchWorkspaces: async () => {
        set({ isLoading: true, error: null });
        try {
          const data = await workspaceService.getAll();
          get().setWorkspaces(data.workspaces);
          set({ isLoading: false });
        } catch (error) {
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Failed to load workspaces',
          });
        }
      },

      createWorkspace: async (payload) => {
        const data = await workspaceService.create(payload);
        const workspaces = [...get().workspaces, data.workspace];
        set({ workspaces, activeWorkspaceId: data.workspace.id });
        return data.workspace;
      },

      updateWorkspace: async (id, payload) => {
        const data = await workspaceService.update(id, payload);
        const workspaces = get().workspaces.map((w) =>
          w.id === id ? data.workspace : w
        );
        set({ workspaces });
        return data.workspace;
      },

      deleteWorkspace: async (id) => {
        await workspaceService.delete(id);
        const workspaces = get().workspaces.filter((w) => w.id !== id);
        const { activeWorkspaceId } = get();
        set({
          workspaces,
          activeWorkspaceId:
            activeWorkspaceId === id ? workspaces[0]?.id || null : activeWorkspaceId,
        });
      },

      clearWorkspaces: () => {
        set({ workspaces: [], activeWorkspaceId: null, error: null });
      },

      getActiveWorkspace: () => {
        const { workspaces, activeWorkspaceId } = get();
        return workspaces.find((w) => w.id === activeWorkspaceId) || null;
      },
    }),
    {
      name: STORAGE_KEYS.workspace,
      partialize: (state) => ({ activeWorkspaceId: state.activeWorkspaceId }),
    }
  )
);
