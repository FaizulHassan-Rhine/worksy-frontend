'use client';

import { Download, FileText } from 'lucide-react';
import { formatFileSize } from '@/constants/file';
import { getFileUrl } from '@/lib/files';

export default function MessageFile({ file }) {
  if (!file) return null;

  const url = getFileUrl(file.fileUrl);
  const isImage = file.fileCategory === 'image';

  if (isImage) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 block max-w-xs overflow-hidden rounded-lg border border-zinc-200/80 dark:border-zinc-700"
      >
        <img src={url} alt={file.fileName} className="max-h-48 w-full object-cover" />
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      download={file.fileName}
      className="mt-2 flex max-w-xs items-center gap-2 rounded-lg border border-zinc-200/80 bg-zinc-50 px-3 py-2 text-xs transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800/50 dark:hover:bg-zinc-800"
    >
      <FileText className="h-4 w-4 shrink-0 text-zinc-500" />
      <span className="min-w-0 flex-1 truncate font-medium text-zinc-800 dark:text-zinc-200">
        {file.fileName}
      </span>
      <span className="shrink-0 text-zinc-400">{formatFileSize(file.fileSize)}</span>
      <Download className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
    </a>
  );
}
