// import { db } from '../db/database';
import { SyncStatus } from './types';
import { getDB } from '../db/provider';
// import { getOrgId } from '../api/org';
import { orgRepository } from './org.repository';
const db = getDB();

export type Case = {
  id: string;
  title: string;
  description?: string;
  caseNumber?: string;
  court?: string;
  status?: string;
  orgId: string;

  createdAt: string;
  updatedAt: string;
  deletedAt?: string;

  lastFetchedAt?: string;

  syncStatus: SyncStatus;
  isSynced: number; // 0 | 1
};

export const CaseRepository = {
  createLocal: (data: Case) => {

    console.log("all orgsgsss", db.getAllSync(
      `SELECT * FROM orgs`));
    const currentOrg = orgRepository.currentOrg();
    const orgId = currentOrg?.id;

    db.runSync(
      `INSERT INTO cases 
      (id, title,orgId, description, caseNumber, court, status, createdAt, updatedAt, syncStatus,isSynced)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.id,
        data.title,
        orgId,
        data.description ?? null,
        data.caseNumber ?? null,
        data.court ?? null,
        data.status ?? null,
        data.createdAt,
        data.updatedAt,
        'PENDING',
        data.isSynced,
      ]
    );
  },

  updateLocal: (id: string, updates: Partial<Case>) => {
    const currentOrg = orgRepository.currentOrg();
    const orgId = currentOrg?.id;
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
    const currentOrg = orgRepository.currentOrg();
    const orgId = currentOrg?.id;
    const res = db.getAllSync(`SELECT * FROM cases WHERE id = ? AND orgId = ?`, [id, orgId]);
    return (res[0] as Case) || null;
  },

  getAll: (): Case[] => {

    const currentOrg = orgRepository.currentOrg();
    const orgId = currentOrg?.id;
    console.log("inside case.repo.ts:", orgId, "dfskf");
    return db.getAllSync(
      `SELECT * FROM cases WHERE deletedAt IS NULL AND orgId = ? ORDER BY createdAt DESC`, [orgId]
    ) as Case[];
  },

  getPending: (): Case[] => {
    const currentOrg = orgRepository.currentOrg();
    const orgId = currentOrg?.id;
    return db.getAllSync(
      `SELECT * FROM cases WHERE syncStatus IN ('PENDING', 'FAILED') AND orgId = ?`, [orgId]
    ) as Case[];
  },

  getFailed: (): Case[] => {
    const currentOrg = orgRepository.currentOrg();
    const orgId = currentOrg?.id;
    return db.getAllSync(
      `SELECT * FROM cases WHERE syncStatus = 'FAILED' AND orgId = ?`, [orgId]
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
    const currentOrg = orgRepository.currentOrg();
    const orgId = currentOrg?.id;
    const now = new Date().toISOString();
    if (!local) {
      console.log("localcase", local);
      db.runSync(
        `INSERT INTO cases 
        (id,orgId, title, description, caseNumber, court, status, createdAt, updatedAt, syncStatus, isSynced, lastFetchedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [

          data.id,
          orgId,
          data.title,
          data.description ?? null,
          data.caseNumber ?? null,
          data.court ?? null,
          data.status ?? null,
          data.createdAt,
          data.updatedAt ?? now,
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

  markDeleted: (id: string) => {
    const now = new Date().toISOString();

    db.runSync(
      `UPDATE cases 
       SET deletedAt = ?, syncStatus = ?
       WHERE id = ?`,
      [now, 'PENDING', id]
    );
  },
};