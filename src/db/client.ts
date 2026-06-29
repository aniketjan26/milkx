import * as SQLite from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from './schema';

const sqlite = SQLite.openDatabaseSync('milkx.db');
export const db = drizzle(sqlite, { schema });

export async function runMigrations() {
  await sqlite.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, phone TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL, collector_id TEXT, farmer_id TEXT, passcode TEXT,
      language TEXT DEFAULT 'en', created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS farmers (
      id TEXT PRIMARY KEY, farmer_id TEXT NOT NULL UNIQUE, name TEXT NOT NULL,
      phone TEXT NOT NULL, address TEXT, collector_id TEXT NOT NULL,
      bank_account TEXT, ifsc TEXT, aadhar TEXT, upi_id TEXT,
      active INTEGER DEFAULT 1, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS milk_entries (
      id TEXT PRIMARY KEY, farmer_id TEXT NOT NULL, collector_id TEXT NOT NULL,
      date TEXT NOT NULL, shift TEXT NOT NULL, volume REAL NOT NULL,
      fat REAL NOT NULL, snf REAL NOT NULL, rate_per_liter REAL NOT NULL,
      total_amount REAL NOT NULL, rate_method TEXT NOT NULL,
      synced INTEGER DEFAULT 0, created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY, farmer_id TEXT NOT NULL, collector_id TEXT NOT NULL,
      amount REAL NOT NULL, type TEXT NOT NULL, status TEXT DEFAULT 'pending',
      period TEXT, notes TEXT, created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_milk_farmer ON milk_entries(farmer_id);
    CREATE INDEX IF NOT EXISTS idx_milk_date ON milk_entries(date);
    CREATE INDEX IF NOT EXISTS idx_farmer_collector ON farmers(collector_id);
  `);
}
