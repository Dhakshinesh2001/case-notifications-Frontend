import { apiClient } from './client';

export const TaskAPI = {
  /**
   * 📥 Get tasks for a case
   */
  getTasks: async (caseId: string) => {
    const res = await apiClient.get(`/task/${caseId}`);
    return res.data || res;
  },

  /**
   * ➕ Create task (PURE API CALL)
   * ❗ No sync logic here
   */
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
    console.log("TaskAPI.createTask");

    const res = await apiClient.post(`/task/${caseId}`, data);

    return res.data || res;
  },

  /**
   * ✏️ Update task
   */
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
    const res = await apiClient.patch(`/task/${taskId}`, data);
    return res.data || res;
  },

  /**
   * 🔄 Update only status
   */
  updateTaskStatus: async (taskId: string, status: string) => {
    const res = await apiClient.patch(`/task/${taskId}/status`, { status });
    return res.data || res;
  },

  /**
   * 🗑️ Delete task
   */
  deleteTask: async (taskId: string) => {
    return apiClient.delete(`/task/${taskId}`);
  },
};