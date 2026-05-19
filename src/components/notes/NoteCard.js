'use client';

import Link from 'next/link';
import { ArrowRight, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getContentPreview, getNoteTypeColor, getNoteTypeLabel } from '@/constants/note';
import { ROUTES } from '@/constants/routes';

export default function NoteCard({ note }) {
  return (
    <Link
      href={ROUTES.noteDetail(note.id)}
      className={cn(
        'group flex flex-col rounded-2xl border border-zinc-200/80 bg-white p-5',
        'shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-all duration-200',
        'hover:border-zinc-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-0.5'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={cn(
            'rounded-lg border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide',
            getNoteTypeColor(note.type)
          )}
        >
          {getNoteTypeLabel(note.type)}
        </span>
        {note.isPrivate && (
          <span className="flex items-center gap-1 text-[10px] text-zinc-400" title="Private note">
            <Lock className="h-3 w-3" />
            Private
          </span>
        )}
      </div>

      <h3 className="mt-3 text-base font-semibold text-zinc-900 group-hover:text-zinc-700">
        {note.title}
      </h3>

      <p className="mt-2 line-clamp-3 text-sm text-zinc-500">{getContentPreview(note.content)}</p>

      <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-4 text-xs text-zinc-400">
        <span>Updated {new Date(note.updatedAt).toLocaleDateString()}</span>
        <span className="flex items-center gap-1 font-medium text-zinc-600 opacity-0 transition-opacity group-hover:opacity-100">
          Open
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}
