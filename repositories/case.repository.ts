// import { db } from '../db/database';
import { SyncStatus } from './types';
import { getDB } from '../db/provider';

const db = getDB();

export type Case = {
  id: string;
  title: string;
  description?: string;
  caseNumber?: string;
  court?: string;
  status?: string;

  createdAt: string;
  updatedAt: string;
  deletedAt?: string;

  lastFetchedAt?: string;

  syncStatus: SyncStatus;
  isSynced: number; // 0 | 1
};

export const CaseRepository = {
  createLocal: (data: Case) => {
    db.runSync(
      `INSERT INTO cases 
      (id, title, description, caseNumber, court, status, createdAt, updatedAt, syncStatus, isSynced)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.id,
        data.title,
        data.description ?? null,
        data.caseNumber ?? null,
        data.court ?? null,
        data.status ?? null,
        data.createdAt,
        data.updatedAt,
        'PENDING',
        0,
      ]
    );
  },

  updateLocal: (id: string, updates: Partial<Case>) => {
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
      `UPDATE cases SET ${fields.join(', ')} WHERE id = ?`,
      [...values, id]
    );
  },

  softDelete: (id: string) => {
    const now = new Date().toISOString();

    db.runSync(
      `UPDATE cases 
       SET deletedAt = ?, syncStatus = ?
       WHERE id = ?`,
      [now, 'PENDING', id]
    );
  },

  getById: (id: string): Case | null => {
    const res = db.getAllSync(`SELECT * FROM cases WHERE id = ?`, [id]);
    return (res[0] as Case) || null;
  },

  getAll: (): Case[] => {
    return db.getAllSync(
      `SELECT * FROM cases WHERE deletedAt IS NULL ORDER BY createdAt DESC`
    ) as Case[];
  },

  getPending: (): Case[] => {
    return db.getAllSync(
      `SELECT * FROM cases WHERE syncStatus = 'PENDING'`
    ) as Case[];
  },

  getFailed: (): Case[] => {
    return db.getAllSync(
      `SELECT * FROM cases WHERE syncStatus = 'FAILED'`
    ) as Case[];
  },

  markSynced: (id: string, updatedAt: string) => {
    db.runSync(
      `UPDATE cases 
       SET syncStatus = ?, isSynced = ?, updatedAt = ?
       WHERE id = ?`,
      ['SYNCED', 1, updatedAt, id]
    );
  },

  markFailed: (id: string) => {
    db.runSync(
      `UPDATE cases SET syncStatus = ? WHERE id = ?`,
      ['FAILED', id]
    );
  },

  removeDeleted: (id: string) => {
    db.runSync(`DELETE FROM cases WHERE id = ?`, [id]);
  },

  upsertFromBackend: (data: any) => {
    const local = CaseRepository.getById(data.id);

    if (!local) {
      db.runSync(
        `INSERT INTO cases 
        (id, title, description, caseNumber, court, status, createdAt, updatedAt, syncStatus, isSynced, lastFetchedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.id,
          data.title,
          data.description ?? null,
          data.caseNumber ?? null,
          data.court ?? null,
          data.status ?? null,
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
        `UPDATE cases SET
          title = ?, description = ?, caseNumber = ?, court = ?, status = ?,
          updatedAt = ?, lastFetchedAt = ?, syncStatus = ?, isSynced = ?
         WHERE id = ?`,
        [
          data.title,
          data.description ?? null,
          data.caseNumber ?? null,
          data.court ?? null,
          data.status ?? null,
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