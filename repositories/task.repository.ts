// import { db } from '../db/database';
import { SyncStatus } from './types';
import { getDB } from '../db/provider';

const db = getDB();

export type Task = {
  id: string;
  caseId: string;
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

    // console.log("reached create local");
    // console.log(data);
    db.runSync(
      `INSERT INTO tasks 
      (id, caseId, eventId, title, description, status, priority, dueDate, createdAt, updatedAt, syncStatus, isSynced)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.id,
        data.caseId,
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

  softDelete: (id: string) => {
    const now = new Date().toISOString();

    db.runSync(
      `UPDATE tasks 
       SET deletedAt = ?, syncStatus = ?
       WHERE id = ?`,
      [now, 'PENDING', id]
    );
  },

  getById: (id: string): Task | null => {
    const res = db.getAllSync(`SELECT * FROM tasks WHERE id = ?`, [id]);
    return (res[0] as Task) || null;
  },

  getByCase: (caseId: string): Task[] => {
    return db.getAllSync(
      `SELECT * FROM tasks WHERE caseId = ? AND deletedAt IS NULL ORDER BY createdAt DESC`,
      [caseId]
    ) as Task[];
  },

  getPending: (): Task[] => {
    return db.getAllSync(
      `SELECT * FROM tasks WHERE syncStatus = 'PENDING'`
    ) as Task[];
  },

  getFailed: (): Task[] => {
    return db.getAllSync(
      `SELECT * FROM tasks WHERE syncStatus = 'FAILED'`
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
    const local = TaskRepository.getById(data.id);

    if (!local) {
      db.runSync(
        `INSERT INTO tasks 
        (id, caseId, eventId, title, description, status, priority, dueDate, createdAt, updatedAt, syncStatus, isSynced, lastFetchedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.id,
          data.caseId,
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
         WHERE id = ?`,
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
        ]
      );
    }
  },
};