import { SyncService } from '@/features/sync/sync.service';
import { orgRepository } from '@/repositories/org.repository';
import { apiClient } from './client';

export const InviteAPI = {
  // getInvites: async () => {
  //   const res = await apiClient.get('/invite');
  //   return res.data || res;
  // },

  createInvite: async (data: {
    email: string;
    role: string;
    id: string;
  }) => {
    return apiClient.post('/invite', data);
  },

  acceptInvite: async (token: string) => {
   const res: any = await InviteAPI.acceptInvite(token);

  const data = res.data || res;

  orgRepository.saveOrg({
    id: data.org.id,
    name: data.org.name,
    role: data.role,
    createdAt: data.org.createdAt,
    updatedAt: data.org.updatedAt,
  });

  // 🔥 HYDRATE ORG
  await SyncService.pullAll();

  return data;
},

  // deleteInvite: async (id: string) => {
  //   return apiClient.delete(`/invite/${id}`);
  // },
};