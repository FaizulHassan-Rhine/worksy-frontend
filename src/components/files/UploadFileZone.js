'use client';

import { useRef, useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const ACCEPT =
  'image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar';

export default function UploadFileZone({
  workspaceId,
  projectId,
  taskId,
  onUpload,
  disabled,
  compact = false,
}) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const uploadFiles = async (fileList) => {
    if (!workspaceId || !fileList?.length) return;

    setIsUploading(true);
    setError('');

    try {
      for (const file of Array.from(fileList)) {
        await onUpload({ file, workspaceId, projectId, taskId });
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || isUploading) return;
    uploadFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-2">
      <div
        role="button"
        tabIndex={0}
        onClick={() => !disabled && !isUploading && inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all',
          compact ? 'px-4 py-6' : 'px-6 py-10',
          isDragging ? 'border-zinc-400 bg-zinc-50' : 'border-zinc-200 bg-zinc-50/50',
          (disabled || isUploading) && 'cursor-not-allowed opacity-50'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPT}
          className="hidden"
          disabled={disabled || isUploading}
          onChange={(e) => uploadFiles(e.target.files)}
        />

        {isUploading ? (
          <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
        ) : (
          <Upload className="h-8 w-8 text-zinc-400" />
        )}

        <p className="mt-3 text-sm font-medium text-zinc-700">
          {isUploading ? 'Uploading...' : 'Drop files or click to upload'}
        </p>
        <p className="mt-1 text-xs text-zinc-400">Images, PDF, docs, zip — max 10MB each</p>
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
