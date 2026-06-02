'use client';

import { useCallback, useEffect, useState } from 'react';
import { BookmarkPlus, Files, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import FileCard from '@/components/files/FileCard';
import UploadFileZone from '@/components/files/UploadFileZone';
import { FILE_CATEGORIES } from '@/constants/file';
import { useWorkspace } from '@/hooks/useWorkspace';
import fileService from '@/services/fileService';
import projectService from '@/services/projectService';
import savedViewService from '@/services/savedViewService';
import Select from '@/components/ui/Select';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';
import { useDialog } from '@/hooks/useDialog';

export default function FilesPage() {
  const { success, error: toastError } = useToast();
  const { confirm, prompt } = useDialog();
  const { activeWorkspace, activeWorkspaceId } = useWorkspace();
  const [files, setFiles] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [savedViews, setSavedViews] = useState([]);
  const [activeSavedViewId, setActiveSavedViewId] = useState('');
  const [isViewActionLoading, setIsViewActionLoading] = useState(false);
  const [savedViewsUnsupported, setSavedViewsUnsupported] = useState(false);

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

  const loadSavedViews = useCallback(async () => {
    if (!activeWorkspaceId) {
      setSavedViews([]);
      setActiveSavedViewId('');
      return;
    }

    try {
      const data = await savedViewService.getAll({
        workspaceId: activeWorkspaceId,
        module: 'files',
      });
      setSavedViews(data.views || []);
      setSavedViewsUnsupported(Boolean(data.unsupported));
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to load saved views');
    }
  }, [activeWorkspaceId, toastError]);

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

  useEffect(() => {
    loadSavedViews();
  }, [loadSavedViews]);

  useEffect(() => {
    setActiveSavedViewId('');
  }, [activeWorkspaceId]);

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
    const confirmed = await confirm({
      title: 'Delete file',
      description: 'Delete this file?',
      confirmText: 'Delete',
    });
    if (!confirmed) return;

    try {
      await fileService.delete(fileId);
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
      success('File deleted');
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to delete file');
    }
  };

  const onApplySavedView = (viewId) => {
    setActiveSavedViewId(viewId);
    if (!viewId) return;
    const selected = savedViews.find((item) => item.id === viewId);
    if (!selected) return;
    setProjectFilter(selected.filters?.projectId || '');
    setCategoryFilter(selected.filters?.category || '');
  };

  const onSaveCurrentView = async () => {
    if (!activeWorkspaceId) return;
    if (savedViewsUnsupported) return;
    const defaultName = activeSavedViewId
      ? savedViews.find((item) => item.id === activeSavedViewId)?.name || ''
      : '';
    const name = await prompt({
      title: activeSavedViewId ? 'Update saved view' : 'Save current view',
      description: 'Enter a name for this saved view.',
      defaultValue: defaultName,
      placeholder: 'Saved view name',
      confirmText: activeSavedViewId ? 'Update' : 'Save',
    });
    if (!name || !name.trim()) return;

    const payload = {
      workspaceId: activeWorkspaceId,
      module: 'files',
      name: name.trim(),
      filters: {
        projectId: projectFilter,
        category: categoryFilter,
      },
    };

    setIsViewActionLoading(true);
    try {
      if (activeSavedViewId) {
        const data = await savedViewService.update(activeSavedViewId, payload);
        if (data.unsupported || !data.view) return;
        setSavedViews((prev) =>
          prev.map((item) => (item.id === activeSavedViewId ? data.view : item))
        );
        success('Saved view updated');
      } else {
        const data = await savedViewService.create(payload);
        if (data.unsupported || !data.view) return;
        setSavedViews((prev) => [data.view, ...prev]);
        setActiveSavedViewId(data.view.id);
        success('Saved view created');
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to save view');
    } finally {
      setIsViewActionLoading(false);
    }
  };

  const onDeleteSavedView = async () => {
    if (!activeSavedViewId) return;
    if (savedViewsUnsupported) return;
    const selected = savedViews.find((item) => item.id === activeSavedViewId);
    const confirmed = await confirm({
      title: 'Delete saved view',
      description: `Delete saved view "${selected?.name || ''}"?`,
      confirmText: 'Delete',
    });
    if (!confirmed) return;

    setIsViewActionLoading(true);
    try {
      await savedViewService.delete(activeSavedViewId);
      setSavedViews((prev) => prev.filter((item) => item.id !== activeSavedViewId));
      setActiveSavedViewId('');
      success('Saved view deleted');
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to delete view');
    } finally {
      setIsViewActionLoading(false);
    }
  };

  return (
    <div className="ml-2 mr-auto w-full max-w-[1400px] space-y-6 sm:ml-3">
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
          className="w-full sm:w-[170px]"
          placeholder="Saved views"
          value={activeSavedViewId}
          onChange={(e) => onApplySavedView(e.target.value)}
          disabled={!activeWorkspaceId || savedViewsUnsupported}
          options={savedViews.map((item) => ({ value: item.id, label: item.name }))}
        />
        <Button
          size="sm"
          variant="secondary"
          disabled={!activeWorkspaceId || isViewActionLoading || savedViewsUnsupported}
          loading={isViewActionLoading}
          onClick={onSaveCurrentView}
        >
          <BookmarkPlus className="h-3.5 w-3.5" />
          {activeSavedViewId ? 'Update view' : 'Save view'}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={!activeSavedViewId || isViewActionLoading || savedViewsUnsupported}
          loading={isViewActionLoading}
          className="text-red-600 hover:bg-red-50"
          onClick={onDeleteSavedView}
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </Button>
        <Select
          size="sm"
          className="w-full sm:w-[200px]"
          placeholder="All projects"
          value={projectFilter}
          onChange={(e) => {
            setProjectFilter(e.target.value);
            setActiveSavedViewId('');
          }}
          disabled={!activeWorkspaceId}
          options={projects.map((p) => ({ value: p.id, label: p.title }))}
        />

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setCategoryFilter('');
              setActiveSavedViewId('');
            }}
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
              onClick={() => {
                setCategoryFilter(c.value);
                setActiveSavedViewId('');
              }}
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
