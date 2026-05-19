import api from '@/lib/axios';

const messageService = {
  getMessages: async ({ workspaceId, projectId = null, recipientId = null, since = null }) => {
    const params = { workspaceId };
    if (projectId) params.projectId = projectId;
    if (recipientId) params.recipientId = recipientId;
    if (since) params.since = since;
    const { data } = await api.get('/messages', { params });
    return data.data;
  },

  sendMessage: async ({
    workspaceId,
    projectId = null,
    recipientId = null,
    content,
    fileId = null,
  }) => {
    const { data } = await api.post('/messages', {
      workspaceId,
      projectId: projectId || null,
      recipientId: recipientId || null,
      content: content || '',
      fileId: fileId || null,
    });
    return data.data;
  },
};

export default messageService;
