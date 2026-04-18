import { db } from '../db/database';
import { generateId } from '../utils/uuid';

export type CaseEvent = {
  id: string;
  caseId: string;
  title: string;
  description?: string;
  eventDate: string;
};

export const EventRepository = {
  createEvent: async (caseId: string, title: string, eventDate: string) => {
    const id = await generateId();
    const now = new Date().toISOString();

    db.runSync(
      `INSERT INTO case_events 
      (id, caseId, title, eventDate, createdAt, updatedAt, syncStatus)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, caseId, title, eventDate, now, now, 'LOCAL']
    );
  },

  getEventsByCase: (caseId: string): CaseEvent[] => {
    const result = db.getAllSync(
      `SELECT * FROM case_events WHERE caseId = ? ORDER BY eventDate ASC`,
      [caseId]
    );
    return result as CaseEvent[];
  },

  deleteEvent: (eventId: string) => {
  db.runSync(`DELETE FROM case_events WHERE id = ?`, [eventId]);
},
};