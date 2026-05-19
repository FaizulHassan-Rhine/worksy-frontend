import api from '@/lib/axios';

const dashboardService = {
  getStats: async (workspaceId) => {
    const { data } = await api.get('/dashboard/stats', { params: { workspaceId } });
    return data.data;
  },
};

export default dashboardService;
