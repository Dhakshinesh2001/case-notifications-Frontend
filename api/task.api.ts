import { apiClient } from './client';
import { SyncService } from '@/features/sync/sync.service';

export const TaskAPI = {
  getTasks: async (caseId: string) => {
    const res = await apiClient.get(`/task/${caseId}`);
    return res.data || res;
  },

  createTask: async (
    caseId: string,
    data: {
      id: string;
      title: string;
      description?: string;
      status: string;
      priority?: string;
      dueDate?: string;
      eventId?: string;
    }
  ) => {
    SyncService.pushCases();
    console.log("taskAPI reached");
    const x = await apiClient.post(`/task/${caseId}`, data);
    console.log(x);
    return apiClient.post(`/task/${caseId}`, data);
  },

  updateTask: async (
    taskId: string,
    data: Partial<{
      title: string;
      description: string;
      status: string;
      priority: string;
      dueDate: string;
      eventId: string;
    }>
  ) => {
    return apiClient.patch(`/task/${taskId}`, data);
  },

  updateTaskStatus: async (taskId: string, status: string) => {
    return apiClient.patch(`/task/${taskId}/status`, { status });
  },

  deleteTask: async (taskId: string) => {
    return apiClient.delete(`/task/${taskId}`);
  },
};