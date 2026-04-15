import { db } from '../db/database';
import { generateId } from '../utils/uuid';

export type Task = {
  id: string;
  caseId: string;
  eventId?: string;
  title: string;
  status: string;
};

export const TaskRepository = {
  createTask: async (
  caseId: string,
  title: string,
  eventId?: string | null
) => {
    const id = await generateId();
    const now = new Date().toISOString();

    db.runSync(
  `INSERT INTO tasks 
  (id, caseId, eventId, title, status, createdAt, updatedAt, syncStatus)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  [id, caseId, eventId ?? null, title, 'OPEN', now, now, 'LOCAL']
);
  },

  updateTaskStatus: (taskId: string, status: string) => {
  const now = new Date().toISOString();

  db.runSync(
    `UPDATE tasks 
     SET status = ?, updatedAt = ?, syncStatus = ?
     WHERE id = ?`,
    [status, now, 'LOCAL', taskId]
  );
},

  getTasksByCase: (caseId: string): Task[] => {
    const result = db.getAllSync(
      `SELECT * FROM tasks WHERE caseId = ? ORDER BY createdAt DESC`,
      [caseId]
    );
    return result as Task[];
  },

};