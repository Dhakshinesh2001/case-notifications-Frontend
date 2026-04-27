import { generateId } from '../../utils/uuid';
import { EventRepository } from '../../repositories/event.repository';
import { SyncService } from '../sync/sync.service';

export const EventService = {
  createEvent: async (caseId: string, data: any) => {
    const now = new Date().toISOString();
    const id = generateId();

    EventRepository.createLocal({
      id,
      caseId,
      ...data,
      createdAt: now,
      updatedAt: now,
      syncStatus: 'PENDING',
      isSynced: 0,
    });

    SyncService.pushEvents();
  },

  updateEvent: async (id: string, updates: any) => {
    EventRepository.updateLocal(id, updates);
    SyncService.pushEvents();
  },

  deleteEvent: async (id: string) => {
    EventRepository.softDelete(id);
    SyncService.pushEvents();
  },

  getEvents: (caseId: string) => {
    return EventRepository.getByCase(caseId);
  },
};