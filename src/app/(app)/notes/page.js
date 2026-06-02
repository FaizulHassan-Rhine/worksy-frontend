'use client';

import { useCallback, useEffect, useState } from 'react';
import { BookmarkPlus, Plus, StickyNote, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import NoteCard from '@/components/notes/NoteCard';
import CreateNoteModal from '@/components/notes/CreateNoteModal';
import { NOTE_TYPES } from '@/constants/note';
import { useWorkspace } from '@/hooks/useWorkspace';
import noteService from '@/services/noteService';
import savedViewService from '@/services/savedViewService';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';
import Select from '@/components/ui/Select';
import { useDialog } from '@/hooks/useDialog';

export default function NotesPage() {
  const { success, error: toastError } = useToast();
  const { confirm, prompt } = useDialog();
  const { activeWorkspace, activeWorkspaceId } = useWorkspace();
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [savedViews, setSavedViews] = useState([]);
  const [activeSavedViewId, setActiveSavedViewId] = useState('');
  const [isViewActionLoading, setIsViewActionLoading] = useState(false);
  const [savedViewsUnsupported, setSavedViewsUnsupported] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const loadNotes = useCallback(async () => {
    if (!activeWorkspaceId) {
      setNotes([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const params = { workspaceId: activeWorkspaceId };
      if (typeFilter) params.type = typeFilter;
      const data = await noteService.getAll(params);
      setNotes(data.notes);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load notes');
    } finally {
      setIsLoading(false);
    }
  }, [activeWorkspaceId, typeFilter]);

  const loadSavedViews = useCallback(async () => {
    if (!activeWorkspaceId) {
      setSavedViews([]);
      setActiveSavedViewId('');
      return;
    }

    try {
      const data = await savedViewService.getAll({
        workspaceId: activeWorkspaceId,
        module: 'notes',
      });
      setSavedViews(data.views || []);
      setSavedViewsUnsupported(Boolean(data.unsupported));
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to load saved views');
    }
  }, [activeWorkspaceId, toastError]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  useEffect(() => {
    loadSavedViews();
  }, [loadSavedViews]);

  useEffect(() => {
    setActiveSavedViewId('');
  }, [activeWorkspaceId]);

  const handleCreate = async (payload) => {
    try {
      const data = await noteService.create(payload);
      setNotes((prev) => [data.note, ...prev]);
      success('Note created');
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to create note');
      throw err;
    }
  };

  const onApplySavedView = (viewId) => {
    setActiveSavedViewId(viewId);
    if (!viewId) return;
    const selected = savedViews.find((item) => item.id === viewId);
    if (!selected) return;
    setTypeFilter(selected.filters?.type || '');
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
      module: 'notes',
      name: name.trim(),
      filters: {
        type: typeFilter,
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-zinc-900">Notes</h1>
          <p className="mt-0.5 text-xs text-zinc-500">
            {activeWorkspace
              ? `Docs and notes in ${activeWorkspace.name}`
              : 'Select a workspace to view notes'}
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} disabled={!activeWorkspaceId}>
          <Plus className="h-4 w-4" />
          New note
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
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
        <button
          type="button"
          onClick={() => {
            setTypeFilter('');
            setActiveSavedViewId('');
          }}
          className={cn(
            'rounded-xl px-3 py-2 text-sm font-medium transition-colors',
            !typeFilter ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
          )}
        >
          All
        </button>
        {NOTE_TYPES.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => {
              setTypeFilter(t.value);
              setActiveSavedViewId('');
            }}
            className={cn(
              'rounded-xl px-3 py-2 text-sm font-medium transition-colors',
              typeFilter === t.value
                ? 'bg-zinc-900 text-white'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : notes.length === 0 ? (
        <EmptyState
          icon={StickyNote}
          title="No notes yet"
          description="Create personal, project, or workspace notes to capture ideas and documentation."
          action={
            <Button onClick={() => setCreateOpen(true)} disabled={!activeWorkspaceId}>
              <Plus className="h-4 w-4" />
              Create note
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      )}

      <CreateNoteModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        workspaceId={activeWorkspaceId}
        onCreated={handleCreate}
      />
    </div>
  );
}
