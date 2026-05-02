import { SyncStatus } from './types';
import { getDB } from '../db/provider';
// import { getOrgId } from '../api/org';
import { orgRepository } from './org.repository';

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
    const currentOrg = orgRepository.currentOrg();
const orgId = currentOrg?.id;
    db.runSync(
      `INSERT OR REPLACE INTO tasks 
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
   const currentOrg = orgRepository.currentOrg();
const orgId = currentOrg?.id;
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
    const currentOrg = orgRepository.currentOrg();
const orgId = currentOrg?.id;

    return db.getAllSync(
      `SELECT * FROM tasks 
       WHERE caseId = ? AND orgId = ? AND deletedAt IS NULL 
       ORDER BY createdAt DESC`,
      [caseId, orgId]
    ) as Task[];
  },

  getPending: (): Task[] => {
    const currentOrg = orgRepository.currentOrg();
const orgId = currentOrg?.id;

    return db.getAllSync(
      `SELECT * FROM tasks 
       WHERE syncStatus IN ('PENDING', 'FAILED') AND orgId = ?`,
      [orgId]
    ) as Task[];
  },

  getFailed: (): Task[] => {
   const currentOrg = orgRepository.currentOrg();
const orgId = currentOrg?.id;

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
   const currentOrg = orgRepository.currentOrg();
const orgId = currentOrg?.id;

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