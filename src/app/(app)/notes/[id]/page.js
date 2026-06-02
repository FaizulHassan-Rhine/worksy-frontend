'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Lock, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Label from '@/components/ui/Label';
import Spinner from '@/components/ui/Spinner';
import MarkdownEditor from '@/components/notes/MarkdownEditor';
import { getNoteTypeColor, getNoteTypeLabel } from '@/constants/note';
import { ROUTES } from '@/constants/routes';
import noteService from '@/services/noteService';
import { cn } from '@/lib/utils';
import { useDialog } from '@/hooks/useDialog';

export default function NoteDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { confirm } = useDialog();
  const [note, setNote] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadNote = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await noteService.getById(id);
      setNote(data.note);
      setTitle(data.note.title);
      setContent(data.note.content || '');
      setIsPrivate(data.note.isPrivate);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load note');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) loadNote();
  }, [id, loadNote]);

  const onSave = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setIsSaving(true);
    setError('');
    setMessage('');
    try {
      const data = await noteService.update(id, {
        title: title.trim(),
        content,
        isPrivate: note.type === 'personal' ? isPrivate : false,
      });
      setNote(data.note);
      setMessage('Note saved');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save note');
    } finally {
      setIsSaving(false);
    }
  };

  const onDelete = async () => {
    const confirmed = await confirm({
      title: 'Delete note',
      description: `Delete "${note?.title}"?`,
      confirmText: 'Delete',
    });
    if (!confirmed) return;

    try {
      await noteService.delete(id);
      router.push(ROUTES.NOTES);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete note');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error && !note) {
    return (
      <div className="ml-2 mr-auto w-full max-w-[1400px] space-y-4 sm:ml-3">
        <Link
          href={ROUTES.NOTES}
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to notes
        </Link>
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="ml-2 mr-auto w-full max-w-[1400px] space-y-6 sm:ml-3">
      <Link
        href={ROUTES.NOTES}
        className="inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-zinc-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to notes
      </Link>

      {message && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <span
          className={cn(
            'rounded-lg border px-2.5 py-1 text-xs font-medium',
            getNoteTypeColor(note.type)
          )}
        >
          {getNoteTypeLabel(note.type)}
        </span>
        {note.isPrivate && (
          <span className="flex items-center gap-1 text-xs text-zinc-500">
            <Lock className="h-3.5 w-3.5" />
            Private
          </span>
        )}
        <span className="text-xs text-zinc-400">
          Updated {new Date(note.updatedAt).toLocaleString()}
        </span>
      </div>

      <div>
        <Label htmlFor="note-edit-title">Title</Label>
        <Input
          id="note-edit-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1"
        />
      </div>

      {note.type === 'personal' && (
        <label className="flex items-center gap-2 text-sm text-zinc-600">
          <input
            type="checkbox"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
            className="rounded border-zinc-300"
          />
          Keep this note private
        </label>
      )}

      <div>
        <Label>Content</Label>
        <div className="mt-2">
          <MarkdownEditor value={content} onChange={setContent} />
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-zinc-100 pt-4 sm:flex-row sm:items-center">
        <Button variant="ghost" className="text-red-600 hover:bg-red-50 sm:mr-auto" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={() => router.push(ROUTES.NOTES)}>
            Cancel
          </Button>
          <Button onClick={onSave} loading={isSaving}>
            Save note
          </Button>
        </div>
      </div>
    </div>
  );
}
