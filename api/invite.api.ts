import { apiClient } from './client';

export const InviteAPI = {
  getInvites: async () => {
    const res = await apiClient.get('/invite');
    return res.data || res;
  },

  createInvite: async (data: {
    email: string;
    role: string;
  }) => {
    return apiClient.post('/invite', data);
  },

  acceptInvite: async (token: string) => {
    return apiClient.post(`/invite/accept`, { token });
  },

  deleteInvite: async (id: string) => {
    return apiClient.delete(`/invite/${id}`);
  },
};