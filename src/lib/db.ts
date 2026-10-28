import path from 'path';
import fs from 'fs';

// Global singleton for Next.js development HMR
declare global {
  // eslint-disable-next-line no-var
  var __travelpulse_db: any | undefined;
}

let dbInstance: any = null;

export function getDb() {
  if (global.__travelpulse_db) {
    return global.__travelpulse_db;
  }
  if (dbInstance) {
    return dbInstance;
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { DatabaseSync } = require('node:sqlite');

  const rawPath = process.env.DATABASE_FILE || 'travelpulse.db';
  const resolvedPath = path.isAbsolute(rawPath)
    ? rawPath
    : path.join(process.cwd(), 'data', path.basename(rawPath));

  const dir = path.dirname(resolvedPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const db = new DatabaseSync(resolvedPath);
  
  // Pragmas for performance and concurrency
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA synchronous = NORMAL;');
  db.exec('PRAGMA foreign_keys = ON;');

  // Initialize schema
  initializeSchema(db);

  dbInstance = db;
  if (process.env.NODE_ENV !== 'production') {
    global.__travelpulse_db = db;
  }

  return db;
}

function initializeSchema(db: any) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      role TEXT NOT NULL,
      full_name TEXT NOT NULL,
      avatar_url TEXT,
      onboarding_complete INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      age_range TEXT,
      travel_group TEXT,
      budget_preference TEXT,
      preferred_destinations TEXT DEFAULT '[]',
      travel_style TEXT,
      interests TEXT DEFAULT '[]',
      food_preferences TEXT DEFAULT '[]',
      adventure_preference TEXT,
      accommodation_preference TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS businesses (
      id TEXT PRIMARY KEY,
      destination_id TEXT NOT NULL,
      owner_id TEXT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      latitude REAL,
      longitude REAL,
      price_range TEXT,
      price_per_unit REAL DEFAULT 0,
      rating REAL DEFAULT 0,
      review_count INTEGER DEFAULT 0,
      contact_phone TEXT,
      contact_email TEXT,
      address TEXT,
      amenities TEXT DEFAULT '[]',
      operating_hours TEXT,
      status TEXT DEFAULT 'APPROVED',
      rejection_reason TEXT,
      submitted_at TEXT,
      reviewed_at TEXT,
      reviewed_by TEXT,
      is_local INTEGER DEFAULT 0,
      is_verified INTEGER DEFAULT 0,
      eco_certified INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (owner_id) REFERENCES profiles(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS listings (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL DEFAULT 0,
      description TEXT,
      status TEXT DEFAULT 'APPROVED',
      rejection_reason TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS business_inquiries (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      inquiry_date TEXT NOT NULL,
      guests INTEGER DEFAULT 1,
      status TEXT DEFAULT 'PENDING',
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS destinations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      state TEXT NOT NULL,
      country TEXT NOT NULL DEFAULT 'India',
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      description TEXT,
      categories TEXT DEFAULT '[]',
      best_season TEXT,
      average_budget_per_day REAL DEFAULT 0,
      image_url TEXT,
      is_published INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS attractions (
      id TEXT PRIMARY KEY,
      destination_id TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      description TEXT,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      entry_fee REAL DEFAULT 0,
      crowd_level TEXT DEFAULT 'MEDIUM',
      is_hidden_gem INTEGER DEFAULT 0,
      is_published INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      admin_id TEXT NOT NULL,
      admin_name TEXT NOT NULL,
      action TEXT NOT NULL,
      target_entity TEXT NOT NULL,
      target_id TEXT NOT NULL,
      details TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS business_analytics (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL,
      date TEXT NOT NULL,
      bookings INTEGER NOT NULL DEFAULT 0,
      revenue REAL NOT NULL DEFAULT 0,
      occupancy_pct INTEGER NOT NULL DEFAULT 0,
      visitor_count INTEGER NOT NULL DEFAULT 0,
      customer_segments TEXT NOT NULL DEFAULT '[]',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
      UNIQUE (business_id, date)
    );

    CREATE INDEX IF NOT EXISTS idx_biz_analytics_date ON business_analytics(business_id, date DESC);

    CREATE TABLE IF NOT EXISTS tourism_summaries (
      id TEXT PRIMARY KEY DEFAULT 'current-overview',
      total_visitors_this_month INTEGER NOT NULL,
      avg_daily_visitors INTEGER NOT NULL,
      avg_spend REAL NOT NULL,
      avg_occupancy INTEGER NOT NULL,
      total_revenue REAL NOT NULL,
      avg_sustainability REAL NOT NULL,
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS safety_facilities (
      id TEXT PRIMARY KEY,
      destination_id TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      phone TEXT,
      address TEXT,
      is_24hr INTEGER DEFAULT 1,
      verification_status TEXT DEFAULT 'VERIFIED',
      emergency_services TEXT DEFAULT '[]',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS itineraries (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      origin TEXT NOT NULL,
      destination TEXT NOT NULL,
      duration_days INTEGER NOT NULL,
      budget REAL NOT NULL,
      travelers INTEGER DEFAULT 1,
      travel_style TEXT,
      interests TEXT DEFAULT '[]',
      food_preference TEXT,
      accommodation_preference TEXT,
      status TEXT DEFAULT 'PLANNED',
      items TEXT NOT NULL,
      optimization_log TEXT DEFAULT '[]',
      total_estimated_cost REAL DEFAULT 0,
      total_distance_km REAL DEFAULT 0,
      local_businesses_count INTEGER DEFAULT 0,
      sustainability_score REAL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS tourism_analytics (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL UNIQUE,
      total_visitors INTEGER NOT NULL DEFAULT 0,
      avg_spend REAL NOT NULL DEFAULT 0,
      hotel_occupancy_pct INTEGER NOT NULL DEFAULT 0,
      local_biz_revenue REAL NOT NULL DEFAULT 0,
      sustainability_index REAL NOT NULL DEFAULT 0,
      top_attractions TEXT DEFAULT '[]',
      crowd_distribution TEXT DEFAULT '[]',
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // Safely add any new columns to existing tables if table already existed prior
  try { db.exec(`ALTER TABLE profiles ADD COLUMN is_active INTEGER DEFAULT 1;`); } catch {}
  try { db.exec(`ALTER TABLE businesses ADD COLUMN status TEXT DEFAULT 'APPROVED';`); } catch {}
  try { db.exec(`ALTER TABLE businesses ADD COLUMN rejection_reason TEXT;`); } catch {}
  try { db.exec(`ALTER TABLE businesses ADD COLUMN operating_hours TEXT;`); } catch {}
  try { db.exec(`ALTER TABLE businesses ADD COLUMN submitted_at TEXT;`); } catch {}
  try { db.exec(`ALTER TABLE businesses ADD COLUMN reviewed_at TEXT;`); } catch {}
  try { db.exec(`ALTER TABLE businesses ADD COLUMN reviewed_by TEXT;`); } catch {}
  try { db.exec(`ALTER TABLE businesses ADD COLUMN image_url TEXT;`); } catch {}
  try { db.exec(`ALTER TABLE businesses ADD COLUMN location TEXT;`); } catch {}
  try { db.exec(`ALTER TABLE businesses ADD COLUMN is_open INTEGER DEFAULT 1;`); } catch {}
  try { db.exec(`ALTER TABLE businesses ADD COLUMN price_level INTEGER DEFAULT 1;`); } catch {}

  try { db.exec(`ALTER TABLE attractions ADD COLUMN image_url TEXT;`); } catch {}
  try { db.exec(`ALTER TABLE attractions ADD COLUMN opening_hours TEXT;`); } catch {}
  try { db.exec(`ALTER TABLE attractions ADD COLUMN avg_visit_duration_min INTEGER DEFAULT 60;`); } catch {}
  try { db.exec(`ALTER TABLE attractions ADD COLUMN visitors_today INTEGER DEFAULT 0;`); } catch {}
  try { db.exec(`ALTER TABLE attractions ADD COLUMN visitors_weekly INTEGER DEFAULT 0;`); } catch {}
  try { db.exec(`ALTER TABLE attractions ADD COLUMN visitors_monthly INTEGER DEFAULT 0;`); } catch {}
  try { db.exec(`ALTER TABLE attractions ADD COLUMN tourism_score REAL DEFAULT 0;`); } catch {}
  try { db.exec(`ALTER TABLE attractions ADD COLUMN tags TEXT DEFAULT '[]';`); } catch {}
}

/**
 * Execute a query that returns multiple rows
 */
export function query<T = any>(sql: string, params: any[] = []): T[] {
  const db = getDb();
  const stmt = db.prepare(sql);
  return stmt.all(...params) as T[];
}

/**
 * Execute a query that returns a single row or null
 */
export function queryOne<T = any>(sql: string, params: any[] = []): T | null {
  const db = getDb();
  const stmt = db.prepare(sql);
  const result = stmt.get(...params);
  return (result as T) || null;
}

/**
 * Execute an INSERT, UPDATE, or DELETE statement
 */
export function execute(sql: string, params: any[] = []): { changes: number; lastInsertRowid: number | bigint } {
  const db = getDb();
  const stmt = db.prepare(sql);
  const result = stmt.run(...params);
  return {
    changes: result.changes,
    lastInsertRowid: result.lastInsertRowid,
  };
}

/**
 * Run a transaction
 */
export function transaction<T>(fn: () => T): T {
  const db = getDb();
  db.exec('BEGIN TRANSACTION;');
  try {
    const res = fn();
    db.exec('COMMIT;');
    return res;
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  }
}
