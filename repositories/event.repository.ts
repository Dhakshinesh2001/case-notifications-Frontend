import { SyncStatus } from './types';
import { getDB } from '../db/provider';
import { getOrgId } from '../api/org';

const db = getDB();

export type CaseEvent = {
  id: string;
  caseId: string;
  orgId: string; // 🔥 added

  type?: string;
  content: string;
  metadata?: string;

  eventDate: string;

  createdAt: string;
  updatedAt: string;
  deletedAt?: string;

  lastFetchedAt?: string;

  syncStatus: SyncStatus;
  isSynced: number;
};

export const EventRepository = {
  createLocal: (data: CaseEvent) => {
    const orgId = getOrgId();

    db.runSync(
      `INSERT INTO case_events 
      (id, caseId, orgId, type, content, metadata, eventDate, createdAt, updatedAt, syncStatus, isSynced)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.id,
        data.caseId,
        orgId,
        data.type ?? null,
        data.content,
        data.metadata ?? null,
        data.eventDate,
        data.createdAt,
        data.updatedAt,
        'PENDING',
        0,
      ]
    );
  },

  updateLocal: (id: string, updates: Partial<CaseEvent>) => {
    const now = new Date().toISOString();

    const fields = [];
    const values: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      fields.push(`${key} = ?`);
      values.push(value);
    });

    fields.push(`updatedAt = ?`);
    values.push(now);

    fields.push(`syncStatus = ?`);
    values.push('PENDING');

    db.runSync(
      `UPDATE case_events SET ${fields.join(', ')} WHERE id = ?`,
      [...values, id]
    );
  },

  markDeleted: (id: string) => {
    const now = new Date().toISOString();

    db.runSync(
      `UPDATE case_events 
       SET deletedAt = ?, syncStatus = ?
       WHERE id = ?`,
      [now, 'PENDING', id]
    );
  },

  getById: (id: string): CaseEvent | null => {
    const orgId = getOrgId();

    const res = db.getAllSync(
      `SELECT * FROM case_events WHERE id = ? AND orgId = ?`,
      [id, orgId]
    );

    return (res[0] as CaseEvent) || null;
  },

  getByIdGlobal: (id: string): CaseEvent | null => {
  const res = db.getAllSync(
    `SELECT * FROM case_events WHERE id = ?`,
    [id]
  );

  return (res[0] as CaseEvent) || null;
},

  getByCase: (caseId: string): CaseEvent[] => {
    const orgId = getOrgId();

    return db.getAllSync(
      `SELECT * FROM case_events 
       WHERE caseId = ? AND orgId = ? AND deletedAt IS NULL 
       ORDER BY eventDate ASC`,
      [caseId, orgId]
    ) as CaseEvent[];
  },

  getPending: (): CaseEvent[] => {
    const orgId = getOrgId();

    return db.getAllSync(
      `SELECT * FROM case_events 
       WHERE syncStatus = 'PENDING' AND orgId = ?`,
      [orgId]
    ) as CaseEvent[];
  },

  getFailed: (): CaseEvent[] => {
    const orgId = getOrgId();

    return db.getAllSync(
      `SELECT * FROM case_events 
       WHERE syncStatus = 'FAILED' AND orgId = ?`,
      [orgId]
    ) as CaseEvent[];
  },

  markSynced: (id: string, updatedAt: string) => {
    db.runSync(
      `UPDATE case_events 
       SET syncStatus = ?, isSynced = ?, updatedAt = ?
       WHERE id = ?`,
      ['SYNCED', 1, updatedAt, id]
    );
  },

  markFailed: (id: string) => {
    db.runSync(
      `UPDATE case_events SET syncStatus = ? WHERE id = ?`,
      ['FAILED', id]
    );
  },

  removeDeleted: (id: string) => {
    db.runSync(`DELETE FROM case_events WHERE id = ?`, [id]);
  },

  upsertFromBackend: (data: any) => {
    const orgId = getOrgId();

    const local = EventRepository.getByIdGlobal(data.id);

    if (!local) {
      db.runSync(
        `INSERT INTO case_events 
        (id, caseId, orgId, type, content, metadata, eventDate, createdAt, updatedAt, syncStatus, isSynced, lastFetchedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.id,
          data.caseId,
          orgId,
          data.type ?? null,
          data.content,
          JSON.stringify(data.metadata ?? {}),
          data.eventDate,
          data.createdAt,
          data.updatedAt,
          'SYNCED',
          1,
          new Date().toISOString(),
        ]
      );
      return;
    }

    if (new Date(data.updatedAt) > new Date(local.updatedAt)) {
      db.runSync(
        `UPDATE case_events SET
          type = ?, content = ?, metadata = ?, eventDate = ?,
          updatedAt = ?, lastFetchedAt = ?, syncStatus = ?, isSynced = ?
         WHERE id = ? AND orgId = ?`,
        [
          data.type ?? null,
          data.content,
          JSON.stringify(data.metadata ?? {}),
          data.eventDate,
          data.updatedAt,
          new Date().toISOString(),
          'SYNCED',
          1,
          data.id,
          orgId,
        ]
      );
    }
  },
};