import api from '@/lib/axios';

const projectService = {
  getAll: async (workspaceId) => {
    const { data } = await api.get('/projects', { params: { workspaceId } });
    return data.data;
  },

  getById: async (id) => {
    const { data } = await api.get(`/projects/${id}`);
    return data.data;
  },

  create: async (payload) => {
    const { data } = await api.post('/projects', payload);
    return data.data;
  },

  update: async (id, payload) => {
    const { data } = await api.patch(`/projects/${id}`, payload);
    return data.data;
  },

  delete: async (id) => {
    const { data } = await api.delete(`/projects/${id}`);
    return data.data;
  },
};

export default projectService;
