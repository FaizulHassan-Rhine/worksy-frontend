import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';

const getUploadHeaders = () => {
  const token = useAuthStore.getState().token;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const fileService = {
  getAll: async (params) => {
    const { data } = await api.get('/files', { params });
    return data.data;
  },

  getById: async (id) => {
    const { data } = await api.get(`/files/${id}`);
    return data.data;
  },

  upload: async ({ file, workspaceId, projectId, taskId }) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('workspaceId', workspaceId);
    if (projectId) formData.append('projectId', projectId);
    if (taskId) formData.append('taskId', taskId);

    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const response = await fetch(`${baseURL}/files/upload`, {
      method: 'POST',
      headers: getUploadHeaders(),
      body: formData,
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
      const error = new Error(result.message || 'Upload failed');
      error.response = { data: result };
      throw error;
    }

    return result.data;
  },

  delete: async (id) => {
    const { data } = await api.delete(`/files/${id}`);
    return data.data;
  },
};

export default fileService;
