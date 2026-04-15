import * as SQLite from 'expo-sqlite';

export const db = SQLite.openDatabaseSync('case-manager.db');