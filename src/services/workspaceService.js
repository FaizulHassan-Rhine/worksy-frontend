import api from '@/lib/axios';

const workspaceService = {
  getAll: async () => {
    const { data } = await api.get('/workspaces');
    return data.data;
  },

  getById: async (id) => {
    const { data } = await api.get(`/workspaces/${id}`);
    return data.data;
  },

  create: async (payload) => {
    const { data } = await api.post('/workspaces', payload);
    return data.data;
  },

  update: async (id, payload) => {
    const { data } = await api.patch(`/workspaces/${id}`, payload);
    return data.data;
  },

  delete: async (id) => {
    const { data } = await api.delete(`/workspaces/${id}`);
    return data.data;
  },

  getMembers: async (id) => {
    const { data } = await api.get(`/workspaces/${id}/members`);
    return data.data;
  },

  inviteMember: async (workspaceId, payload) => {
    const { data } = await api.post(`/workspaces/${workspaceId}/invite`, payload);
    return data.data;
  },

  updateMemberRole: async (workspaceId, memberId, role) => {
    const { data } = await api.patch(`/workspaces/${workspaceId}/members/${memberId}/role`, {
      role,
    });
    return data.data;
  },

  removeMember: async (workspaceId, memberId) => {
    const { data } = await api.delete(`/workspaces/${workspaceId}/members/${memberId}`);
    return data.data;
  },
};

export default workspaceService;
