import { generateId } from '../../utils/uuid';
import { TaskRepository } from '../../repositories/task.repository';
import { SyncService } from '../sync/sync.service';

export const TaskService = {
  createTask: async (caseId: string, data: any) => {
    const now = new Date().toISOString();
    const id = generateId();

    console.log(data);

    TaskRepository.createLocal({
      id,
      caseId,
      ...data,
      createdAt: now,
      updatedAt: now,
      syncStatus: 'PENDING',
      isSynced: 0,
    });

    SyncService.pushTasks();
  },

  updateTask: async (id: string, updates: any) => {
    TaskRepository.updateLocal(id, updates);
    SyncService.pushTasks();
  },

  updateTaskStatus: async (id: string, status: string) => {
    TaskRepository.updateLocal(id, { status });
    SyncService.pushTasks();
  },

  deleteTask: async (id: string) => {
    TaskRepository.softDelete(id);
    SyncService.pushTasks();
  },

  getTasks: (caseId: string) => {
    return TaskRepository.getByCase(caseId);
  },
};