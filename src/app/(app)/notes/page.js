'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus, StickyNote } from 'lucide-react';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import NoteCard from '@/components/notes/NoteCard';
import CreateNoteModal from '@/components/notes/CreateNoteModal';
import { NOTE_TYPES } from '@/constants/note';
import { useWorkspace } from '@/hooks/useWorkspace';
import noteService from '@/services/noteService';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/useToast';

export default function NotesPage() {
  const { success, error: toastError } = useToast();
  const { activeWorkspace, activeWorkspaceId } = useWorkspace();
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
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

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

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

  return (
    <div className="mx-auto max-w-6xl space-y-6">
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

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setTypeFilter('')}
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
            onClick={() => setTypeFilter(t.value)}
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
