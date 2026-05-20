import { apiClient } from './client';
import { generateId } from '../utils/uuid';

export const OrgAPI = {
  getOrgs: async () => {
    const res = await apiClient.get('/org');
    console.log(res.data || res);
    return res.data || res;
  },

  getOrgById: async (id: string) => {
    console.log("org.api.ts----IDID:",id);
    const res = await apiClient.get(`/org/${id}`);
    console.log("org.api.ts RES:", res);
    return res.data || res;
  },

 createOrg: async (data: any) => {
    // const id=generateId();
  return apiClient.post('/org', {
    id: data.id,
    orgId: data.id,
    name: data.name,
  });
},

  updateOrg: async (id: string, data: any) => {
    return apiClient.patch(`/org/${id}`, data);
  },

  deleteOrg: async (id: string) => {
    return apiClient.delete(`/org/${id}`);
  },

  acceptInvite: async (token: string) => {
  return apiClient.post('/invite/accept', {
    token,
  });
},
};