import api from '@/lib/axios';

const isNotFound = (error) => error?.response?.status === 404;

const savedViewService = {
  getAll: async (params) => {
    try {
      const { data } = await api.get('/saved-views', { params });
      return data.data;
    } catch (error) {
      if (isNotFound(error)) {
        return { views: [], unsupported: true };
      }
      throw error;
    }
  },

  create: async (payload) => {
    try {
      const { data } = await api.post('/saved-views', payload);
      return data.data;
    } catch (error) {
      if (isNotFound(error)) {
        return { view: null, unsupported: true };
      }
      throw error;
    }
  },

  update: async (id, payload) => {
    try {
      const { data } = await api.patch(`/saved-views/${id}`, payload);
      return data.data;
    } catch (error) {
      if (isNotFound(error)) {
        return { view: null, unsupported: true };
      }
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const { data } = await api.delete(`/saved-views/${id}`);
      return data.data;
    } catch (error) {
      if (isNotFound(error)) {
        return { unsupported: true };
      }
      throw error;
    }
  },
};

export default savedViewService;
