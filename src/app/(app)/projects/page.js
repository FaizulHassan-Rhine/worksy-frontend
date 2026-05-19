'use client';

import { useCallback, useEffect, useState } from 'react';
import { FolderKanban, Plus } from 'lucide-react';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import ProjectCard from '@/components/project/ProjectCard';
import CreateProjectModal from '@/components/project/CreateProjectModal';
import { useWorkspace } from '@/hooks/useWorkspace';
import projectService from '@/services/projectService';
import { useToast } from '@/hooks/useToast';

export default function ProjectsPage() {
  const { success, error: toastError } = useToast();
  const { activeWorkspace, activeWorkspaceId } = useWorkspace();
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [createOpen, setCreateOpen] = useState(false);

  const loadProjects = useCallback(async () => {
    if (!activeWorkspaceId) {
      setProjects([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const data = await projectService.getAll(activeWorkspaceId);
      setProjects(data.projects);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  }, [activeWorkspaceId]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleCreate = async (payload) => {
    try {
      const data = await projectService.create(payload);
      setProjects((prev) => [data.project, ...prev]);
      success('Project created');
      return data;
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to create project');
      throw err;
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-zinc-900">Projects</h1>
          <p className="mt-0.5 text-xs text-zinc-500">
            {activeWorkspace
              ? `Projects in ${activeWorkspace.name}`
              : 'Select a workspace to view projects'}
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} disabled={!activeWorkspaceId}>
          <Plus className="h-4 w-4" />
          New project
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Create your first project to start organizing tasks in this workspace."
          action={
            <Button onClick={() => setCreateOpen(true)} disabled={!activeWorkspaceId}>
              <Plus className="h-4 w-4" />
              Create project
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      <CreateProjectModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        workspaceId={activeWorkspaceId}
        onCreated={handleCreate}
      />
    </div>
  );
}
