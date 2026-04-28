import { apiClient } from './client';

export const CaseAPI = {
  getCases: async () => {
    const res = await apiClient.get('/case');
    return res.data || res;
  },

  getCaseById: async (id: string) => {
    const res = await apiClient.get(`/case/${id}`);
    return res.data || res;
  },

  createCase: async (data: {
    id: string;
    title: string;
    description?: string;
    caseNumber?: string;
    court?: string;
    status?: string;
    metadata?: string;
  }) => {
    console.log("inside create case");
    return apiClient.post('/case', data);
  },

  updateCase: async (
    id: string,
    data: Partial<{
      title: string;
      description: string;
      caseNumber: string;
      court: string;
      status: string;
      metadata: string;
    }>
  ) => {
    console.log("inside update cases");
    return apiClient.patch(`/case/${id}`, data);
  },

  deleteCase: async (id: string) => {
    return apiClient.delete(`/case/${id}`);
  },
};