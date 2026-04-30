import { SyncStatus } from './types';
import { getDB } from '../db/provider';
import { getOrgId } from '../api/org';

const db = getDB();

export type Task = {
  id: string;
  caseId: string;
  orgId: string; // 🔥 added
  eventId?: string;

  title: string;
  description?: string;
  status: string;
  priority?: string;
  dueDate?: string;

  createdAt: string;
  updatedAt: string;
  deletedAt?: string;

  lastFetchedAt?: string;

  syncStatus: SyncStatus;
  isSynced: number;
};

export const TaskRepository = {
  createLocal: (data: Task) => {
    const orgId = getOrgId();

    db.runSync(
      `INSERT OR REPLACE tasks 
      (id, caseId, orgId, eventId, title, description, status, priority, dueDate, createdAt, updatedAt, syncStatus, isSynced)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.id,
        data.caseId,
        orgId,
        data.eventId ?? null,
        data.title,
        data.description ?? null,
        data.status,
        data.priority ?? null,
        data.dueDate ?? null,
        data.createdAt,
        data.updatedAt,
        'PENDING',
        0,
      ]
    );
  },

  updateLocal: (id: string, updates: Partial<Task>) => {
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
      `UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`,
      [...values, id]
    );
  },

  markDeleted: (id: string) => {
    const now = new Date().toISOString();

    db.runSync(
      `UPDATE tasks 
       SET deletedAt = ?, syncStatus = ?
       WHERE id = ?`,
      [now, 'PENDING', id]
    );
  },

  getById: (id: string): Task | null => {
    const orgId = getOrgId();

    const res = db.getAllSync(
      `SELECT * FROM tasks WHERE id = ? AND orgId = ?`,
      [id, orgId]
    );

    return (res[0] as Task) || null;
  },

  getByIdGlobal: (id: string): Task | null => {
  const res = db.getAllSync(
    `SELECT * FROM tasks WHERE id = ?`,
    [id]
  );

  return (res[0] as Task) || null;
},

  getByCase: (caseId: string): Task[] => {
    const orgId = getOrgId();

    return db.getAllSync(
      `SELECT * FROM tasks 
       WHERE caseId = ? AND orgId = ? AND deletedAt IS NULL 
       ORDER BY createdAt DESC`,
      [caseId, orgId]
    ) as Task[];
  },

  getPending: (): Task[] => {
    const orgId = getOrgId();

    return db.getAllSync(
      `SELECT * FROM tasks 
       WHERE syncStatus = 'PENDING' AND orgId = ?`,
      [orgId]
    ) as Task[];
  },

  getFailed: (): Task[] => {
    const orgId = getOrgId();

    return db.getAllSync(
      `SELECT * FROM tasks 
       WHERE syncStatus = 'FAILED' AND orgId = ?`,
      [orgId]
    ) as Task[];
  },

  markSynced: (id: string, updatedAt: string) => {
    db.runSync(
      `UPDATE tasks 
       SET syncStatus = ?, isSynced = ?, updatedAt = ?
       WHERE id = ?`,
      ['SYNCED', 1, updatedAt, id]
    );
  },

  markFailed: (id: string) => {
    db.runSync(
      `UPDATE tasks SET syncStatus = ? WHERE id = ?`,
      ['FAILED', id]
    );
  },

  removeDeleted: (id: string) => {
    db.runSync(`DELETE FROM tasks WHERE id = ?`, [id]);
  },

  upsertFromBackend: (data: any) => {
    const orgId = getOrgId();

    const local = TaskRepository.getByIdGlobal(data.id);

    if (!local) {
      db.runSync(
        `INSERT OR REPLACE INTO tasks 
        (id, caseId, orgId, eventId, title, description, status, priority, dueDate, createdAt, updatedAt, syncStatus, isSynced, lastFetchedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.id,
          data.caseId,
          orgId,
          data.eventId ?? null,
          data.title,
          data.description ?? null,
          data.status,
          data.priority ?? null,
          data.dueDate ?? null,
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
        `UPDATE tasks SET
          title = ?, description = ?, status = ?, priority = ?, dueDate = ?,
          updatedAt = ?, lastFetchedAt = ?, syncStatus = ?, isSynced = ?
         WHERE id = ? AND orgId = ?`,
        [
          data.title,
          data.description ?? null,
          data.status,
          data.priority ?? null,
          data.dueDate ?? null,
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