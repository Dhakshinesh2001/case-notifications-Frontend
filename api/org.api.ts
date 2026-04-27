import { apiClient } from './client';

export const OrgAPI = {
  getOrgs: async () => {
    const res = await apiClient.get('/org');
    return res.data || res;
  },

  getOrgById: async (id: string) => {
    const res = await apiClient.get(`/org/${id}`);
    return res.data || res;
  },

  createOrg: async (data: any) => {
    return apiClient.post('/org', data);
  },

  updateOrg: async (id: string, data: any) => {
    return apiClient.patch(`/org/${id}`, data);
  },

  deleteOrg: async (id: string) => {
    return apiClient.delete(`/org/${id}`);
  },
};