'use client';

import { useState } from 'react';
import { Download, Eye, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { formatFileSize, getFileCategoryIcon, canPreviewFile } from '@/constants/file';
import { getFileUrl } from '@/lib/files';
import { cn } from '@/lib/utils';

export default function FileCard({ file, onDelete, compact = false }) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const Icon = getFileCategoryIcon(file.fileCategory);
  const fileUrl = getFileUrl(file.fileUrl);
  const showPreview = canPreviewFile(file);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = file.fileName;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div
        className={cn(
          'flex items-start gap-4 rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm transition-all hover:border-zinc-300 hover:shadow-md',
          compact && 'p-3'
        )}
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-100">
          {file.fileCategory === 'image' ? (
            <img
              src={fileUrl}
              alt={file.fileName}
              className="h-11 w-11 rounded-xl object-cover"
            />
          ) : (
            <Icon className="h-5 w-5 text-zinc-600" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-zinc-900">{file.fileName}</p>
          <p className="mt-0.5 text-xs text-zinc-500">
            {formatFileSize(file.fileSize)} · {new Date(file.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="flex shrink-0 gap-1">
          {showPreview && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setPreviewOpen(true)}
              title="Preview"
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
          <Button type="button" variant="ghost" size="sm" onClick={handleDownload} title="Download">
            <Download className="h-4 w-4" />
          </Button>
          {onDelete && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-red-600 hover:bg-red-50"
              onClick={() => onDelete(file.id)}
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {previewOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-zinc-900/60 p-4 backdrop-blur-sm"
          onClick={() => setPreviewOpen(false)}
        >
          <div
            className="relative max-h-[90vh] max-w-4xl overflow-auto rounded-2xl bg-white p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between gap-4">
              <p className="truncate text-sm font-medium text-zinc-900">{file.fileName}</p>
              <Button type="button" variant="secondary" size="sm" onClick={() => setPreviewOpen(false)}>
                Close
              </Button>
            </div>
            {file.fileCategory === 'image' ? (
              <img src={fileUrl} alt={file.fileName} className="max-h-[70vh] rounded-xl object-contain" />
            ) : (
              <iframe
                src={fileUrl}
                title={file.fileName}
                className="h-[70vh] w-full min-w-[300px] rounded-xl border border-zinc-200"
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
