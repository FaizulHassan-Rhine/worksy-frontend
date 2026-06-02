import api from '@/lib/axios';

const notificationService = {
  getAll: async (params) => {
    const { data } = await api.get('/notifications', { params });
    return data.data;
  },

  getUnreadCount: async (params) => {
    const { data } = await api.get('/notifications/unread-count', { params });
    return data.data;
  },

  markRead: async (id) => {
    const { data } = await api.patch(`/notifications/${id}/read`);
    return data.data;
  },

  markAllRead: async (workspaceId) => {
    const { data } = await api.patch('/notifications/read-all', {
      workspaceId: workspaceId || undefined,
    });
    return data.data;
  },
};

export default notificationService;
