'use client';

import { useRef } from 'react';
import { Paperclip, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const ACCEPT =
  'image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar';

export default function PendingAttachments({
  files,
  onChange,
  disabled = false,
  className,
}) {
  const inputRef = useRef(null);

  const addFiles = (fileList) => {
    if (!fileList?.length) return;
    const next = [...files, ...Array.from(fileList)];
    onChange(next);
  };

  const removeFile = (index) => {
    onChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Attachments</span>
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200/80 px-2.5 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          <Paperclip className="h-3.5 w-3.5" />
          Add files
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPT}
          className="hidden"
          disabled={disabled}
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = '';
          }}
        />
      </div>

      {files.length > 0 ? (
        <ul className="space-y-1.5 rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-2 dark:border-zinc-700 dark:bg-zinc-900/50">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${file.size}-${index}`}
              className="flex items-center gap-2 rounded-lg bg-white px-2.5 py-1.5 text-xs dark:bg-zinc-900"
            >
              <Paperclip className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
              <span className="min-w-0 flex-1 truncate text-zinc-700 dark:text-zinc-300">
                {file.name}
              </span>
              <button
                type="button"
                disabled={disabled}
                onClick={() => removeFile(index)}
                className="rounded p-0.5 text-zinc-400 hover:text-zinc-600 disabled:opacity-50"
                aria-label={`Remove ${file.name}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-zinc-400">Optional — attach images, PDFs, or documents</p>
      )}
    </div>
  );
}
