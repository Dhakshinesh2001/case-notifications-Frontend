import { db } from '../db/database';
import { generateId } from '../utils/uuid';

export type Case = {
  id: string;
  title: string;
  description?: string;
  caseNumber?: string;
  createdAt: string;
  updatedAt: string;
  syncStatus: string;
};

export const CaseRepository = {
  createCase: async (title: string) => {
    const id = await generateId();
    const now = new Date().toISOString();

    db.runSync(
      `INSERT INTO cases (id, title, createdAt, updatedAt, syncStatus)
       VALUES (?, ?, ?, ?, ?)`,
      [id, title, now, now, 'LOCAL']
    );
  },

  getAllCases: (): Case[] => {
    const result = db.getAllSync(`SELECT * FROM cases ORDER BY createdAt DESC`);
    return result as Case[];
  },

  deleteCase: (id: string) => {
    db.runSync(`DELETE FROM cases WHERE id = ?`, [id]);
  },
};