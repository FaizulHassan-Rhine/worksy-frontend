'use client';

import { useCallback, useEffect, useState } from 'react';
import Spinner from '@/components/ui/Spinner';
import FileCard from '@/components/files/FileCard';
import UploadFileZone from '@/components/files/UploadFileZone';
import fileService from '@/services/fileService';
import { useDialog } from '@/hooks/useDialog';

export default function FileAttachments({
  workspaceId,
  projectId = null,
  taskId = null,
  title = 'Attachments',
  compact = false,
}) {
  const { confirm } = useDialog();
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadFiles = useCallback(async () => {
    if (!workspaceId) {
      setFiles([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const params = { workspaceId };
      if (projectId) params.projectId = projectId;
      if (taskId) params.taskId = taskId;
      const data = await fileService.getAll(params);
      setFiles(data.files);
    } catch {
      setFiles([]);
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId, projectId, taskId]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const handleUpload = async (payload) => {
    const data = await fileService.upload(payload);
    setFiles((prev) => [data.file, ...prev]);
  };

  const handleDelete = async (fileId) => {
    const confirmed = await confirm({
      title: 'Delete file',
      description: 'Delete this file?',
      confirmText: 'Delete',
    });
    if (!confirmed) return;

    await fileService.delete(fileId);
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-zinc-900">{title}</h4>

      <UploadFileZone
        workspaceId={workspaceId}
        projectId={projectId}
        taskId={taskId}
        onUpload={handleUpload}
        disabled={!workspaceId}
        compact={compact}
      />

      {isLoading ? (
        <div className="flex justify-center py-6">
          <Spinner />
        </div>
      ) : files.length === 0 ? (
        <p className="text-center text-sm text-zinc-400">No files attached yet</p>
      ) : (
        <div className="space-y-2">
          {files.map((file) => (
            <FileCard key={file.id} file={file} onDelete={handleDelete} compact />
          ))}
        </div>
      )}
    </div>
  );
}
