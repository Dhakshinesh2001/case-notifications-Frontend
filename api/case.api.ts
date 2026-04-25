import { apiClient } from './client';

export const CaseAPI = {
  getCases: async () => {
    const res = await apiClient.get('/case');
    return res.data;
  },

  getCaseById: async (id: string) => {
  return apiClient.get(`/case/${id}`);
},

  createCase: async (data: {
    title: string;
    caseNumber?: string;
    court?: string;
    status?: string;
  }) => {
    return apiClient.post('/case', data);
  },
};