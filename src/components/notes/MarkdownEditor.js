'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { markdownToHtml } from '@/lib/markdown';

export default function MarkdownEditor({ value, onChange, placeholder, rows = 16 }) {
  const [tab, setTab] = useState('write');

  return (
    <div className="space-y-3">
      <div className="flex rounded-xl border border-zinc-200 bg-zinc-50 p-1">
        <button
          type="button"
          onClick={() => setTab('write')}
          className={cn(
            'flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
            tab === 'write' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
          )}
        >
          Write
        </button>
        <button
          type="button"
          onClick={() => setTab('preview')}
          className={cn(
            'flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
            tab === 'preview' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
          )}
        >
          Preview
        </button>
      </div>

      {tab === 'write' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          placeholder={placeholder || 'Write in Markdown...'}
          className="flex w-full resize-y rounded-xl border border-zinc-200 bg-white px-4 py-3 font-mono text-sm text-zinc-900 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300"
        />
      ) : (
        <div
          className="min-h-[200px] rounded-xl border border-zinc-200 bg-white px-4 py-3"
          dangerouslySetInnerHTML={{
            __html: value ? markdownToHtml(value) : '<p class="text-zinc-400 text-sm">Nothing to preview</p>',
          }}
        />
      )}

      <p className="text-xs text-zinc-400">
        Supports **bold**, *italic*, # headings, - lists, `code`, and [links](url)
      </p>
    </div>
  );
}
