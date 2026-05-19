import api from '@/lib/axios';

const noteService = {
  getAll: async (params) => {
    const { data } = await api.get('/notes', { params });
    return data.data;
  },

  getById: async (id) => {
    const { data } = await api.get(`/notes/${id}`);
    return data.data;
  },

  create: async (payload) => {
    const { data } = await api.post('/notes', payload);
    return data.data;
  },

  update: async (id, payload) => {
    const { data } = await api.patch(`/notes/${id}`, payload);
    return data.data;
  },

  delete: async (id) => {
    const { data } = await api.delete(`/notes/${id}`);
    return data.data;
  },
};

export default noteService;
