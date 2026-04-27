import { generateId } from '../../utils/uuid';
import { SyncService } from '../sync/sync.service';
import { EventRepository } from './event.repository';
import { TaskRepository } from './task.repository';

export const CaseDetailService = {
  // ================= EVENTS =================

  addEvent: async (caseId: string, data: any) => {
    const now = new Date().toISOString();
    const id =  generateId();

    EventRepository.insert({
      id,
      caseId,
      type: data.type,
      content: data.content,
      metadata: data.metadata,
      createdAt: now,
      updatedAt: now,
      syncStatus: 'PENDING',
    });

    SyncService.syncAll();
  },

  updateEvent: async (id: string, data: any) => {
    EventRepository.update(id, {
      ...data,
      updatedAt: new Date().toISOString(),
      syncStatus: 'PENDING',
    });

    SyncService.syncAll();
  },

  deleteEvent: async (id: string) => {
    EventRepository.markDeleted(id);
    SyncService.syncAll();
  },

  // ================= TASKS =================

  addTask: async (caseId: string, data: any) => {
    const now = new Date().toISOString();
    const id = generateId();

    TaskRepository.insert({
      id,
      caseId,
      title: data.title,
      description: data.description,
      priority: data.priority,
      status: data.status ?? 'OPEN',
      dueDate: data.dueDate,
      assignees: data.assignees,

      createdAt: now,
      updatedAt: now,
      syncStatus: 'PENDING',
    });

    SyncService.syncAll();
  },

  updateTask: async (id: string, data: any) => {
    TaskRepository.update(id, {
      ...data,
      updatedAt: new Date().toISOString(),
      syncStatus: 'PENDING',
    });

    SyncService.syncAll();
  },

  updateTaskStatus: async (id: string, status: string) => {
    TaskRepository.update(id, {
      status,
      updatedAt: new Date().toISOString(),
      syncStatus: 'PENDING',
    });

    SyncService.syncAll();
  },

  deleteTask: async (id: string) => {
    TaskRepository.markDeleted(id);
    SyncService.syncAll();
  },
};