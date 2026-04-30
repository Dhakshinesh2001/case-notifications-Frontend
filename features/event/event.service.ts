import { EventRepository } from '../../repositories/event.repository';
import { SyncService } from '../sync/sync.service';
import { generateId } from '../../utils/uuid';

export const EventService = {
  /**
   * 📥 Get events for case
   */
  getEvents: (caseId: string) => {
    return EventRepository.getByCase(caseId);
  },

  /**
   * ➕ Create event
   */
  createEvent: (caseId: string, data: any) => {
    const now = new Date().toISOString();
    console.log("caseID:", caseId);

    const event = {
      id: generateId(),
      caseId,
      ...data,
      createdAt: now,
      updatedAt: now,
      syncStatus: 'PENDING',
      isSynced: 0,
    };

    EventRepository.createLocal(event);
    SyncService.syncNow();
  },

  /**
   * ✏️ Update event
   */
  updateEvent: (id: string, updates: any) => {
    EventRepository.updateLocal(id, {
      ...updates,
      updatedAt: new Date().toISOString(),
      syncStatus: 'PENDING',
    });

    SyncService.syncNow();
  },

  /**
   * 🗑️ Delete event
   */
  deleteEvent: (id: string) => {
    EventRepository.markDeleted(id);
    SyncService.syncNow();
  },
};