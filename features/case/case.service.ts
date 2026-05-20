import { CaseRepository } from '../../repositories/case.repository';
import { CaseMapper } from '../../mappers/case.mapper';
import { SyncService } from '../sync/sync.service';
import { generateId } from '../../utils/uuid';
import { EventRepository } from '@/repositories/event.repository';



export const CaseService = {
  /**
   * 📥 Get all cases (local DB only)
   * UI should always read from local DB
   */
  getCases: () => {
    return CaseRepository.getAll();
  },

  /**
   * 📥 Get single case by ID (local)
   */
  getCaseById: (id: string) => {
    return CaseRepository.getById(id);
  },

  /**
   * ➕ Create new case (local-first)
   * - Immediately saved locally
   * - Sync happens in background
   */
  createCase: (data: any) => {
    console.log("inside case service");
    const now = new Date().toISOString();

    const newCase = {
      id: generateId(),
      ...data,
      createdAt: now,
      updatedAt: now,
      syncStatus: 'PENDING',
      isSynced: 0,
    };

    CaseRepository.createLocal(newCase);

    // 🔄 Trigger background sync
    SyncService.scheduleSync();
  },

  /**
   * ✏️ Update case (local-first)
   */
  updateCase: (id: string, updates: any) => {
    CaseRepository.updateLocal(id, {
      ...updates,
      updatedAt: new Date().toISOString(),
      syncStatus: 'PENDING',
    });

    SyncService.scheduleSync();
  },

  /**
   * 🗑️ Soft delete case
   */
  deleteCase: (id: string) => {
    CaseRepository.markDeleted(id);
    SyncService.scheduleSync();
  },

  /**
   * 🔁 Sync a single case + related data
   * Useful when opening case details page
   */
  syncCase: async (id: string) => {
    try {
      await SyncService.syncAll();
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  },

  getCasesWithNextEvent: () => {
  const cases = CaseRepository.getAll();
  const events = EventRepository.getAll();

  // 🔹 Normalize today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 🔹 Group events by caseId
  const eventsByCase: Record<string, any[]> = {};

  for (const event of events) {
    if (!event.caseId) continue;

    if (!eventsByCase[event.caseId]) {
      eventsByCase[event.caseId] = [];
    }

    eventsByCase[event.caseId].push(event);
  }

  // 🔹 Compute next event per case
  return cases.map((c) => {
    const caseEvents = eventsByCase[c.id] || [];

    if (!caseEvents.length) {
      return {
        ...c,
        nextEventDate: null,
        nextEvent: null,
      };
    }

    let futureEvents: any[] = [];
    let pastEvents: any[] = [];

    for (const e of caseEvents) {
      if (!e.eventDate) continue;

      const eventDate = new Date(e.eventDate);
      eventDate.setHours(0, 0, 0, 0);

      if (eventDate >= today) {
        futureEvents.push(e);
      } else {
        pastEvents.push(e);
      }
    }

    let selectedEvent = null;

    if (futureEvents.length) {
      futureEvents.sort(
        (a, b) =>
          new Date(a.eventDate).getTime() -
          new Date(b.eventDate).getTime()
      );
      selectedEvent = futureEvents[0];
    } else if (pastEvents.length) {
      pastEvents.sort(
        (a, b) =>
          new Date(b.eventDate).getTime() -
          new Date(a.eventDate).getTime()
      );
      selectedEvent = pastEvents[0];
    }

    return {
      ...c,
      nextEventDate: selectedEvent?.eventDate ?? null,
      nextEvent: selectedEvent ?? null,
    };
  });
},
};