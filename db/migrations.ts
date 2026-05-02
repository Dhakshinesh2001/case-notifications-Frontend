import { Alert } from 'react-native';
import { db } from './database';

export const runMigrations = () => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS orgs (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      role TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      deletedAt TEXT,
      isCurrentOrg INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS cases (
      id TEXT PRIMARY KEY NOT NULL,
      orgId TEXT,
      title TEXT NOT NULL,
      description TEXT,
      caseNumber TEXT,
      court TEXT,
      status TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      syncStatus TEXT NOT NULL,
      isSynced INTEGER DEFAULT 0,
      deletedAt TEXT,
      lastFetchedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS case_events (
      id TEXT PRIMARY KEY NOT NULL,
      caseId TEXT NOT NULL,
      orgId TEXT,
      type TEXT,
      content TEXT NOT NULL,
      metadata TEXT,
      eventDate TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      syncStatus TEXT NOT NULL,
      isSynced INTEGER DEFAULT 0,
      deletedAt TEXT,
      lastFetchedAt TEXT,
      notifiedToday INTEGER DEFAULT 0,
      notifiedTomorrow INTEGER DEFAULT 0,
      lastNotifiedAt TEXT

    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY NOT NULL,
      caseId TEXT NOT NULL,
      orgId TEXT,
      eventId TEXT,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL,
      priority TEXT,
      dueDate TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      syncStatus TEXT NOT NULL,
      isSynced INTEGER DEFAULT 0,
      deletedAt TEXT,
      lastFetchedAt TEXT
      
    );

    CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY NOT NULL,
    eventId TEXT,
    title TEXT,
    message TEXT,
    type TEXT, -- TODAY / TOMORROW
    createdAt TEXT NOT NULL,
    read INTEGER DEFAULT 0
    );


    CREATE INDEX IF NOT EXISTS idx_cases_orgId ON cases(orgId);
    CREATE INDEX IF NOT EXISTS idx_tasks_orgId ON tasks(orgId);
    CREATE INDEX IF NOT EXISTS idx_events_orgId ON case_events(orgId);
    CREATE INDEX IF NOT EXISTS idx_notifications_eventId ON notifications(eventId);
  `);

  const x = (db.runSync(
            `INSERT OR REPLACE INTO orgs
      (id, name, role, createdAt, updatedAt, deletedAt, isCurrentOrg) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                '6a684985-190d-40a8-8270-8493d307e54b',
                'Yvyv',
                'ADMIN',
                '2026-04-30T06:16:29.016Z',
                '',
                '',
                1, // New orgs start as inactive by default
            ]
        ));
        // Alert.alert("after insert");
};