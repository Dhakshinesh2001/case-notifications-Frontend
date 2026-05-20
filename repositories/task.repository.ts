import { SyncStatus } from './types';
import { getDB } from '../db/provider';
import { orgRepository } from './org.repository';

const db = getDB();

export type Task = {
  id: string;
  caseId: string;
  orgId: string;
  eventId?: string;

  title: string;
  description?: string;

  status: string;
  priority?: string;

  dueDate?: string | null;

  assignedUserIds?: string[];

  createdAt: string;
  updatedAt: string;

  deletedAt?: string | null;

  lastFetchedAt?: string;

  syncStatus: SyncStatus;
  isSynced: number;
};

const parseTask = (task: any): Task => ({
  ...task,
  assignedUserIds: task.assignedUserIds
    ? JSON.parse(task.assignedUserIds)
    : [],
});

export const TaskRepository = {
  createLocal: (data: Task) => {
    const currentOrg = orgRepository.currentOrg();
    const orgId = currentOrg?.id;

    db.runSync(
      `
      INSERT OR REPLACE INTO tasks 
      (
        id,
        caseId,
        orgId,
        eventId,
        title,
        description,
        status,
        priority,
        dueDate,
        assignedUserIds,
        createdAt,
        updatedAt,
        syncStatus,
        isSynced
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
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
        JSON.stringify(data.assignedUserIds ?? []),
        data.createdAt,
        data.updatedAt,
        'PENDING',
        0,
      ]
    );
  },

  updateLocal: (id: string, updates: Partial<Task>) => {
    const now = new Date().toISOString();

    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      fields.push(`${key} = ?`);

      if (key === 'assignedUserIds') {
        values.push(JSON.stringify(value ?? []));
      } else {
        values.push(value);
      }
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
      `
      UPDATE tasks 
      SET deletedAt = ?, syncStatus = ?
      WHERE id = ?
      `,
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

    if (!res.length) return null;

    return parseTask(res[0]);
  },

  getByIdGlobal: (id: string): Task | null => {
    const res = db.getAllSync(
      `SELECT * FROM tasks WHERE id = ?`,
      [id]
    );

    if (!res.length) return null;

    return parseTask(res[0]);
  },

  getByCase: (caseId: string): Task[] => {
    const currentOrg = orgRepository.currentOrg();
    const orgId = currentOrg?.id;

    const rows = db.getAllSync(
      `
      SELECT * FROM tasks
      WHERE caseId = ? 
      AND orgId = ?
      AND deletedAt IS NULL
      ORDER BY createdAt DESC
      `,
      [caseId, orgId]
    ) as any[];

    return rows.map(parseTask);
  },

  getPending: (): Task[] => {
    const currentOrg = orgRepository.currentOrg();
    const orgId = currentOrg?.id;

    const rows = db.getAllSync(
      `
      SELECT * FROM tasks 
      WHERE syncStatus IN ('PENDING', 'FAILED')
      AND orgId = ?
      `,
      [orgId]
    ) as any[];

    return rows.map(parseTask);
  },

  getFailed: (): Task[] => {
    const currentOrg = orgRepository.currentOrg();
    const orgId = currentOrg?.id;

    const rows = db.getAllSync(
      `
      SELECT * FROM tasks 
      WHERE syncStatus = 'FAILED'
      AND orgId = ?
      `,
      [orgId]
    ) as any[];

    return rows.map(parseTask);
  },

  markSynced: (id: string, updatedAt: string) => {
    db.runSync(
      `
      UPDATE tasks 
      SET syncStatus = ?, isSynced = ?, updatedAt = ?
      WHERE id = ?
      `,
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
    db.runSync(
      `DELETE FROM tasks WHERE id = ?`,
      [id]
    );
  },

  upsertFromBackend: (data: any) => {
    const currentOrg = orgRepository.currentOrg();
    const orgId = currentOrg?.id;

    const local = TaskRepository.getByIdGlobal(data.id);

    if (!local) {
      db.runSync(
        `
        INSERT OR REPLACE INTO tasks 
        (
          id,
          caseId,
          orgId,
          eventId,
          title,
          description,
          status,
          priority,
          dueDate,
          assignedUserIds,
          createdAt,
          updatedAt,
          syncStatus,
          isSynced,
          lastFetchedAt
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
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
          JSON.stringify(data.assignedUserIds ?? []),
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
        `
        UPDATE tasks SET
          title = ?,
          description = ?,
          status = ?,
          priority = ?,
          dueDate = ?,
          assignedUserIds = ?,
          updatedAt = ?,
          lastFetchedAt = ?,
          syncStatus = ?,
          isSynced = ?
        WHERE id = ? AND orgId = ?
        `,
        [
          data.title,
          data.description ?? null,
          data.status,
          data.priority ?? null,
          data.dueDate ?? null,
          JSON.stringify(data.assignedUserIds ?? []),
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