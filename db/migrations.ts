import { db } from './database';

export const runMigrations = () => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS cases (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      caseNumber TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      syncStatus TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS case_events (
      id TEXT PRIMARY KEY NOT NULL,
      caseId TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      eventDate TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      syncStatus TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY NOT NULL,
      caseId TEXT NOT NULL,
      eventId TEXT,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL,
      dueDate TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      syncStatus TEXT NOT NULL
    );
  `);
};