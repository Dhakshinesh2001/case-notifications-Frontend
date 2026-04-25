import { db } from '../db/database';
import { generateId } from '../utils/uuid';
import { isOnline } from '../utils/network';
import { CaseAPI } from '../api/case.api';

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
  createCase: async (title: string) => {//TODO remove later if unused
    const id = await generateId();
    const now = new Date().toISOString();

    db.runSync(
      `INSERT INTO cases (id, title, createdAt, updatedAt, syncStatus)
       VALUES (?, ?, ?, ?, ?)`,
      [id, title, now, now, 'LOCAL']
    );
  },

  getAllCases: (): Case[] => {//TODO remove if unused
    const result = db.getAllSync(`SELECT * FROM cases ORDER BY createdAt DESC`);
    return result as Case[];
  },

  deleteCase: (id: string) => {
  db.runSync(`DELETE FROM tasks WHERE caseId = ?`, [id]);
  db.runSync(`DELETE FROM case_events WHERE caseId = ?`, [id]);
  db.runSync(`DELETE FROM cases WHERE id = ?`, [id]);
},

updateCase: (id: string, title: string) => {
  const now = new Date().toISOString();

  db.runSync(
    `UPDATE cases 
     SET title = ?, updatedAt = ?, syncStatus = ?
     WHERE id = ?`,
    [title, now, 'LOCAL', id]
  );
},

updateCaseWithConflictCheck: async (
  id: string,
  title: string
) => {
  const online = await isOnline();

  // 🟡 OFFLINE → allow
  if (!online) {
    CaseRepository.updateCase(id, title);
    return;
  }

  // 🟢 ONLINE → check backend
  const remote = await CaseAPI.getCaseById(id);

  const local = CaseRepository.getAllCases().find(c => c.id === id);

  if (!local) return;

  // 🔴 CONFLICT
  if (new Date(remote.updatedAt) > new Date(local.updatedAt)) {
    throw new Error('CONFLICT');
  }

  // ✅ SAFE → update locally
  CaseRepository.updateCase(id, title);
},

saveCasesFromBackend: (cases: any[]) => {
  cases.forEach((c) => {
    db.runSync(
      `INSERT OR REPLACE INTO cases 
      (id, title, caseNumber, createdAt, updatedAt, syncStatus)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        c.id,
        c.title,
        c.caseNumber ?? null,
        c.createdAt,
        c.updatedAt,
        'SYNCED',
      ]
    );
  });
},

getCases: async (onUpdate?: (cases: Case[]) => void): Promise<Case[]> => {
  // 1️⃣ Return local data immediately
  const local = db.getAllSync(
    `SELECT * FROM cases ORDER BY createdAt DESC`
  ) as Case[];

  // 2️⃣ Background fetch (don’t block UI)
  (async () => {
    try {
      const remote = await CaseAPI.getCases();

      CaseRepository.saveCasesFromBackend(remote);

      const updated = db.getAllSync(
        `SELECT * FROM cases ORDER BY createdAt DESC`
      ) as Case[];

      onUpdate?.(updated); // 🔥 notify UI
    } catch (err) {
      console.log('Background sync failed', err);
    }
  })();

  

  return local;
},

createCaseLocal: async (title: string) => {
  const id = await generateId();
  const now = new Date().toISOString();

  db.runSync(
    `INSERT INTO cases 
    (id, title, createdAt, updatedAt, syncStatus)
    VALUES (?, ?, ?, ?, ?)`,
    [id, title, now, now, 'PENDING']
  );

  return {
    id,
    title,
    createdAt: now,
    updatedAt: now,
    syncStatus: 'PENDING',
  };
},

getPendingCases: (): Case[] => {
  return db.getAllSync(
    `SELECT * FROM cases WHERE syncStatus = 'PENDING'`
  );
},

markCaseAsSynced: (id: string, updatedAt: string) => {
  db.runSync(
    `UPDATE cases 
     SET syncStatus = ?, updatedAt = ?
     WHERE id = ?`,
    ['SYNCED', updatedAt, id]
  );
},

pushCases: async () => {
  const pending = CaseRepository.getPendingCases();

  for (const c of pending) {
    try {
      const res = await CaseAPI.createCase({
        title: c.title,
        caseNumber: c.caseNumber,
      });

      // ✅ mark synced
      CaseRepository.markCaseAsSynced(
        c.id,
        res.updatedAt
      );

    } catch (err) {
      console.log('Push failed for case', c.id);
      // ❌ keep as PENDING
    }
  }
},
};