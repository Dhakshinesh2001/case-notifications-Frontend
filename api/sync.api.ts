import { apiClient } from './client';

export const SyncAPI = {
    sync: async (since?: string) => {
        let endpoint = '/sync';

        if (since) {
            endpoint += `?since=${since}`;
        }
        const res = await apiClient.get('/sync');
        return res.data || res; // 🔥 unwrap here
    },

    syncCase: async (caseId: string) => {
  const res = await apiClient.get(`/case/${caseId}`);
  return res.data || res;
},
};