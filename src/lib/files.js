import fileService from '@/services/fileService';

export const getApiOrigin = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  return apiUrl.replace(/\/api\/?$/, '');
};

export const getFileUrl = (fileUrl) => {
  if (!fileUrl) return '';
  if (fileUrl.startsWith('http')) return fileUrl;
  return `${getApiOrigin()}${fileUrl}`;
};

export async function uploadFilesToEntity(files, { workspaceId, projectId = null, taskId = null }) {
  if (!files?.length || !workspaceId) return;

  for (const file of files) {
    await fileService.upload({
      file,
      workspaceId,
      projectId: projectId || undefined,
      taskId: taskId || undefined,
    });
  }
}
