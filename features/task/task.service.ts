import { TaskRepository } from '../../repositories/task.repository';
import { SyncService } from '../sync/sync.service';
import { generateId } from '../../utils/uuid';

export const TaskService = {
  /**
   * 📥 Get all tasks for a case
   */
  getTasks: (caseId: string) => {
    return TaskRepository.getByCase(caseId);
  },

  /**
   * ➕ Create task (local-first)
   */
  createTask: (caseId: string, data: any) => {
    const now = new Date().toISOString();

    const task = {
      id: generateId(),
      caseId,
      ...data,
      createdAt: now,
      updatedAt: now,
      syncStatus: 'PENDING',
      isSynced: 0,
    };

    TaskRepository.createLocal(task);
    SyncService.syncNow();
  },

  /**
   * ✏️ Update task
   */
  updateTask: (id: string, updates: any) => {
    TaskRepository.updateLocal(id, {
      ...updates,
      updatedAt: new Date().toISOString(),
      syncStatus: 'PENDING',
    });

    SyncService.scheduleSync();
  },

  /**
   * 🔁 Quick status update (optimized UX)
   */
  updateTaskStatus: (id: string, status: string) => {
    TaskRepository.updateLocal(id, {
      status,
      updatedAt: new Date().toISOString(),
      syncStatus: 'PENDING',
    });

    SyncService.scheduleSync();
  },

  /**
   * 🗑️ Delete task
   */
  deleteTask: (id: string) => {
    TaskRepository.markDeleted(id);
    SyncService.syncNow();
  },
};