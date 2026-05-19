'use client';

import { useCallback, useEffect, useState } from 'react';
import { Files } from 'lucide-react';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import FileCard from '@/components/files/FileCard';
import UploadFileZone from '@/components/files/UploadFileZone';
import { FILE_CATEGORIES } from '@/constants/file';
import { useWorkspace } from '@/hooks/useWorkspace';
import fileService from '@/services/fileService';
import projectService from '@/services/projectService';
import Select from '@/components/ui/Select';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';

export default function FilesPage() {
  const { success, error: toastError } = useToast();
  const { activeWorkspace, activeWorkspaceId } = useWorkspace();
  const [files, setFiles] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');

  const loadFiles = useCallback(async () => {
    if (!activeWorkspaceId) {
      setFiles([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const params = { workspaceId: activeWorkspaceId };
      if (projectFilter) params.projectId = projectFilter;
      const data = await fileService.getAll(params);
      let list = data.files;
      if (categoryFilter) {
        list = list.filter((f) => f.fileCategory === categoryFilter);
      }
      setFiles(list);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load files');
    } finally {
      setIsLoading(false);
    }
  }, [activeWorkspaceId, projectFilter, categoryFilter]);

  useEffect(() => {
    if (!activeWorkspaceId) {
      setProjects([]);
      return;
    }
    projectService
      .getAll(activeWorkspaceId)
      .then((data) => setProjects(data.projects || []))
      .catch(() => setProjects([]));
  }, [activeWorkspaceId]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const handleUpload = async (payload) => {
    try {
      const data = await fileService.upload({
        ...payload,
        projectId: projectFilter || payload.projectId,
      });
      setFiles((prev) => [data.file, ...prev]);
      success('File uploaded');
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to upload file');
      throw err;
    }
  };

  const handleDelete = async (fileId) => {
    const confirmed = window.confirm('Delete this file?');
    if (!confirmed) return;

    try {
      await fileService.delete(fileId);
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
      success('File deleted');
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to delete file');
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-zinc-900">Files</h1>
        <p className="mt-0.5 text-xs text-zinc-500">
          {activeWorkspace
            ? `Upload and manage files in ${activeWorkspace.name}`
            : 'Select a workspace to manage files'}
        </p>
      </div>

      <UploadFileZone
        workspaceId={activeWorkspaceId}
        projectId={projectFilter || undefined}
        onUpload={handleUpload}
        disabled={!activeWorkspaceId}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
        <Select
          size="sm"
          className="w-full sm:w-[200px]"
          placeholder="All projects"
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
          disabled={!activeWorkspaceId}
          options={projects.map((p) => ({ value: p.id, label: p.title }))}
        />

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategoryFilter('')}
            className={cn(
              'rounded-xl px-3 py-2 text-sm font-medium transition-colors',
              !categoryFilter ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            )}
          >
            All types
          </button>
          {FILE_CATEGORIES.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setCategoryFilter(c.value)}
              className={cn(
                'rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                categoryFilter === c.value
                  ? 'bg-zinc-900 text-white'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : files.length === 0 ? (
        <EmptyState
          icon={Files}
          title="No files yet"
          description="Upload images, PDFs, documents, or archives to keep everything in one place."
        />
      ) : (
        <div className="space-y-3">
          {files.map((file) => (
            <FileCard key={file.id} file={file} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
