import { db } from './database';

export const runMigrations = () => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS cases (
      id TEXT PRIMARY KEY NOT NULL,
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
      type TEXT,
      content TEXT NOT NULL,
      metadata TEXT,
      eventDate TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      syncStatus TEXT NOT NULL,
      isSynced INTEGER DEFAULT 0,
      deletedAt TEXT,
      lastFetchedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY NOT NULL,
      caseId TEXT NOT NULL,
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
  `);
};