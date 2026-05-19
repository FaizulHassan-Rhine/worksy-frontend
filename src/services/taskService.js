import api from '@/lib/axios';

const taskService = {
  getAll: async (params) => {
    const { data } = await api.get('/tasks', { params });
    return data.data;
  },

  getToday: async (params) => {
    const { data } = await api.get('/tasks/today', { params });
    return data.data;
  },

  getById: async (id) => {
    const { data } = await api.get(`/tasks/${id}`);
    return data.data;
  },

  create: async (payload) => {
    const { data } = await api.post('/tasks', payload);
    return data.data;
  },

  update: async (id, payload) => {
    const { data } = await api.patch(`/tasks/${id}`, payload);
    return data.data;
  },

  updateStatus: async (id, status) => {
    const { data } = await api.patch(`/tasks/${id}/status`, { status });
    return data.data;
  },

  assign: async (id, assignee) => {
    const { data } = await api.patch(`/tasks/${id}/assign`, { assignee });
    return data.data;
  },

  delete: async (id) => {
    const { data } = await api.delete(`/tasks/${id}`);
    return data.data;
  },
};

export default taskService;
