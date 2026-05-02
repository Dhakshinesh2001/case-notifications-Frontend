import { getDB } from '@/db/provider';

const db = getDB();

export const NotificationRepository = {
  getAll: () => {
    return db.getAllSync(
      `SELECT * FROM notifications ORDER BY createdAt DESC`
    );
  },

  markAsRead: (id: string) => {
    db.runSync(
      `UPDATE notifications SET read = 1 WHERE id = ?`,
      [id]
    );
  },

  markAllAsRead: () => {
    db.runSync(`UPDATE notifications SET read = 1`);
  },
};