import api from '@/lib/axios';

const authService = {
  register: async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    return data.data;
  },

  login: async (payload) => {
    const { data } = await api.post('/auth/login', payload);
    return data.data;
  },

  me: async () => {
    const { data } = await api.get('/auth/me');
    return data.data;
  },

  logout: async () => {
    const { data } = await api.post('/auth/logout');
    return data.data;
  },
};

export default authService;
