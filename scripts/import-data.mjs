import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';

const PROJECT_ROOT = process.cwd();
const DATA_FILE = path.join(PROJECT_ROOT, 'data', 'source-data.json');
const LOG_FILE = path.join(PROJECT_ROOT, 'scripts', 'import-errors.log');
const DB_FILE = path.join(PROJECT_ROOT, 'data', 'travelpulse.db');

fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });

fs.writeFileSync(LOG_FILE, `Import Run: ${new Date().toISOString()}\n=====================================\n`);

function logError(entity, item, errorMsg) {
  const line = `[ERROR] [${entity}] ID: ${item?.id || 'unknown'} - ${errorMsg}\nPayload: ${JSON.stringify(item)}\n\n`;
  fs.appendFileSync(LOG_FILE, line);
}

const db = new DatabaseSync(DB_FILE);
db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA journal_mode = WAL;');

// Schema creation
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
`);

// Additive column migrations
try { db.exec(`ALTER TABLE profiles ADD COLUMN is_active INTEGER DEFAULT 1;`); } catch {}
try { db.exec(`ALTER TABLE businesses ADD COLUMN status TEXT DEFAULT 'APPROVED';`); } catch {}
try { db.exec(`ALTER TABLE businesses ADD COLUMN rejection_reason TEXT;`); } catch {}
try { db.exec(`ALTER TABLE businesses ADD COLUMN operating_hours TEXT;`); } catch {}
try { db.exec(`ALTER TABLE businesses ADD COLUMN submitted_at TEXT;`); } catch {}
try { db.exec(`ALTER TABLE businesses ADD COLUMN reviewed_at TEXT;`); } catch {}
try { db.exec(`ALTER TABLE businesses ADD COLUMN reviewed_by TEXT;`); } catch {}

console.log('--- Starting Complete Data Import ---');
const rawData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));

const stats = {
  profiles: { total: 0, inserted: 0, failed: 0 },
  destinations: { total: 0, inserted: 0, failed: 0 },
  attractions: { total: 0, inserted: 0, failed: 0 },
  businesses: { total: 0, inserted: 0, failed: 0 },
  listings: { total: 0, inserted: 0, failed: 0 },
  inquiries: { total: 0, inserted: 0, failed: 0 },
  audit_logs: { total: 0, inserted: 0, failed: 0 },
  business_analytics: { total: 0, inserted: 0, failed: 0 },
  tourism_summary: { total: 0, inserted: 0, failed: 0 },
};

db.exec('BEGIN TRANSACTION;');
try {
  // 1. Profiles
  const profileStmt = db.prepare(`
    INSERT INTO profiles (
      id, role, full_name, avatar_url, onboarding_complete, is_active,
      age_range, travel_group, budget_preference, preferred_destinations,
      travel_style, interests, food_preferences, adventure_preference,
      accommodation_preference, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      role = excluded.role,
      full_name = excluded.full_name,
      avatar_url = excluded.avatar_url,
      onboarding_complete = excluded.onboarding_complete,
      is_active = excluded.is_active,
      age_range = excluded.age_range,
      travel_group = excluded.travel_group,
      budget_preference = excluded.budget_preference,
      preferred_destinations = excluded.preferred_destinations,
      travel_style = excluded.travel_style,
      interests = excluded.interests,
      food_preferences = excluded.food_preferences,
      adventure_preference = excluded.adventure_preference,
      accommodation_preference = excluded.accommodation_preference,
      updated_at = excluded.updated_at
  `);

  for (const p of (rawData.profiles || [])) {
    stats.profiles.total++;
    try {
      profileStmt.run(
        p.id,
        p.role,
        p.full_name,
        p.avatar_url || null,
        p.onboarding_complete ? 1 : 0,
        p.is_active !== undefined ? (p.is_active ? 1 : 0) : 1,
        p.age_range || null,
        p.travel_group || null,
        p.budget_preference || null,
        JSON.stringify(p.preferred_destinations || []),
        p.travel_style || null,
        JSON.stringify(p.interests || []),
        JSON.stringify(p.food_preferences || []),
        p.adventure_preference || null,
        p.accommodation_preference || null,
        p.created_at || new Date().toISOString(),
        p.updated_at || new Date().toISOString()
      );
      stats.profiles.inserted++;
    } catch (err) {
      stats.profiles.failed++;
      logError('profiles', p, err.message);
    }
  }

  // 2. Destinations
  const destStmt = db.prepare(`
    INSERT INTO destinations (
      id, name, state, country, latitude, longitude, description,
      categories, best_season, average_budget_per_day, image_url, is_published, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      state = excluded.state,
      country = excluded.country,
      latitude = excluded.latitude,
      longitude = excluded.longitude,
      description = excluded.description,
      categories = excluded.categories,
      best_season = excluded.best_season,
      average_budget_per_day = excluded.average_budget_per_day,
      image_url = excluded.image_url,
      is_published = excluded.is_published
  `);

  for (const d of (rawData.destinations || [])) {
    stats.destinations.total++;
    try {
      destStmt.run(
        d.id,
        d.name,
        d.state,
        d.country || 'India',
        d.latitude || 0,
        d.longitude || 0,
        d.description || '',
        JSON.stringify(d.categories || []),
        d.best_season || '',
        d.average_budget_per_day || 0,
        d.image_url || '',
        d.is_published !== undefined ? (d.is_published ? 1 : 0) : 1,
        new Date().toISOString()
      );
      stats.destinations.inserted++;
    } catch (err) {
      stats.destinations.failed++;
      logError('destinations', d, err.message);
    }
  }

  // 3. Attractions
  const attrStmt = db.prepare(`
    INSERT INTO attractions (
      id, destination_id, name, type, description, latitude, longitude,
      entry_fee, crowd_level, is_hidden_gem, is_published, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      destination_id = excluded.destination_id,
      name = excluded.name,
      type = excluded.type,
      description = excluded.description,
      latitude = excluded.latitude,
      longitude = excluded.longitude,
      entry_fee = excluded.entry_fee,
      crowd_level = excluded.crowd_level,
      is_hidden_gem = excluded.is_hidden_gem,
      is_published = excluded.is_published
  `);

  for (const a of (rawData.attractions || [])) {
    stats.attractions.total++;
    try {
      attrStmt.run(
        a.id,
        a.destination_id,
        a.name,
        a.type || 'viewpoint',
        a.description || '',
        a.latitude || 0,
        a.longitude || 0,
        a.entry_fee || 0,
        a.crowd_level || 'MEDIUM',
        a.is_hidden_gem ? 1 : 0,
        a.is_published !== undefined ? (a.is_published ? 1 : 0) : 1,
        new Date().toISOString()
      );
      stats.attractions.inserted++;
    } catch (err) {
      stats.attractions.failed++;
      logError('attractions', a, err.message);
    }
  }

  // 4. Businesses
  const bizStmt = db.prepare(`
    INSERT INTO businesses (
      id, destination_id, owner_id, name, category, description,
      latitude, longitude, price_range, price_per_unit, rating,
      review_count, contact_phone, contact_email, address, amenities,
      operating_hours, status, rejection_reason, submitted_at, reviewed_at,
      reviewed_by, is_local, is_verified, eco_certified, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      destination_id = excluded.destination_id,
      owner_id = excluded.owner_id,
      name = excluded.name,
      category = excluded.category,
      description = excluded.description,
      latitude = excluded.latitude,
      longitude = excluded.longitude,
      price_range = excluded.price_range,
      price_per_unit = excluded.price_per_unit,
      rating = excluded.rating,
      review_count = excluded.review_count,
      contact_phone = excluded.contact_phone,
      contact_email = excluded.contact_email,
      address = excluded.address,
      amenities = excluded.amenities,
      operating_hours = excluded.operating_hours,
      status = excluded.status,
      rejection_reason = excluded.rejection_reason,
      submitted_at = excluded.submitted_at,
      reviewed_at = excluded.reviewed_at,
      reviewed_by = excluded.reviewed_by,
      is_local = excluded.is_local,
      is_verified = excluded.is_verified,
      eco_certified = excluded.eco_certified
  `);

  for (const b of (rawData.businesses || [])) {
    stats.businesses.total++;
    try {
      bizStmt.run(
        b.id,
        b.destination_id || 'dest-mahabaleshwar',
        b.owner_id || null,
        b.name,
        b.category,
        b.description || '',
        b.latitude || 0,
        b.longitude || 0,
        b.price_range || null,
        b.price_per_unit || 0,
        b.rating || 0,
        b.review_count || 0,
        b.contact_phone || null,
        b.contact_email || null,
        b.address || '',
        JSON.stringify(b.amenities || []),
        b.operating_hours || '9:00 AM - 9:00 PM',
        b.status || 'APPROVED',
        b.rejection_reason || null,
        b.submitted_at || new Date().toISOString(),
        b.reviewed_at || null,
        b.reviewed_by || null,
        b.is_local ? 1 : 0,
        b.is_verified ? 1 : 0,
        b.eco_certified ? 1 : 0,
        new Date().toISOString()
      );
      stats.businesses.inserted++;
    } catch (err) {
      stats.businesses.failed++;
      logError('businesses', b, err.message);
    }
  }

  // 5. Listings
  const listingStmt = db.prepare(`
    INSERT INTO listings (
      id, business_id, title, category, price, description, status, rejection_reason, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      business_id = excluded.business_id,
      title = excluded.title,
      category = excluded.category,
      price = excluded.price,
      description = excluded.description,
      status = excluded.status,
      rejection_reason = excluded.rejection_reason,
      updated_at = excluded.updated_at
  `);

  for (const l of (rawData.listings || [])) {
    stats.listings.total++;
    try {
      listingStmt.run(
        l.id,
        l.business_id,
        l.title,
        l.category,
        l.price || 0,
        l.description || '',
        l.status || 'APPROVED',
        l.rejection_reason || null,
        l.created_at || new Date().toISOString(),
        l.updated_at || new Date().toISOString()
      );
      stats.listings.inserted++;
    } catch (err) {
      stats.listings.failed++;
      logError('listings', l, err.message);
    }
  }

  // 6. Inquiries
  const inqStmt = db.prepare(`
    INSERT INTO business_inquiries (
      id, business_id, customer_name, customer_email, inquiry_date, guests, status, notes, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      customer_name = excluded.customer_name,
      customer_email = excluded.customer_email,
      inquiry_date = excluded.inquiry_date,
      guests = excluded.guests,
      status = excluded.status,
      notes = excluded.notes
  `);

  for (const inq of (rawData.business_inquiries || [])) {
    stats.inquiries.total++;
    try {
      inqStmt.run(
        inq.id,
        inq.business_id,
        inq.customer_name,
        inq.customer_email,
        inq.inquiry_date,
        inq.guests || 1,
        inq.status || 'PENDING',
        inq.notes || '',
        inq.created_at || new Date().toISOString()
      );
      stats.inquiries.inserted++;
    } catch (err) {
      stats.inquiries.failed++;
      logError('business_inquiries', inq, err.message);
    }
  }

  // 7. Audit logs
  const auditStmt = db.prepare(`
    INSERT INTO audit_logs (
      id, admin_id, admin_name, action, target_entity, target_id, details, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      details = excluded.details
  `);

  for (const log of (rawData.audit_logs || [])) {
    stats.audit_logs.total++;
    try {
      auditStmt.run(
        log.id,
        log.admin_id,
        log.admin_name,
        log.action,
        log.target_entity,
        log.target_id,
        log.details || '',
        log.created_at || new Date().toISOString()
      );
      stats.audit_logs.inserted++;
    } catch (err) {
      stats.audit_logs.failed++;
      logError('audit_logs', log, err.message);
    }
  }

  // 8. Business Analytics
  const analyticsStmt = db.prepare(`
    INSERT INTO business_analytics (
      id, business_id, date, bookings, revenue,
      occupancy_pct, visitor_count, customer_segments, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      business_id = excluded.business_id,
      date = excluded.date,
      bookings = excluded.bookings,
      revenue = excluded.revenue,
      occupancy_pct = excluded.occupancy_pct,
      visitor_count = excluded.visitor_count,
      customer_segments = excluded.customer_segments
  `);

  for (const a of (rawData.business_analytics || [])) {
    stats.business_analytics.total++;
    try {
      analyticsStmt.run(
        a.id,
        a.business_id,
        a.date,
        Number(a.bookings) || 0,
        Number(a.revenue) || 0,
        Number(a.occupancy_pct) || 0,
        Number(a.visitor_count) || 0,
        JSON.stringify(a.customer_segments || []),
        new Date().toISOString()
      );
      stats.business_analytics.inserted++;
    } catch (err) {
      stats.business_analytics.failed++;
      logError('business_analytics', a, err.message);
    }
  }

  // 9. Tourism Summary
  const summaryStmt = db.prepare(`
    INSERT INTO tourism_summaries (
      id, total_visitors_this_month, avg_daily_visitors, avg_spend,
      avg_occupancy, total_revenue, avg_sustainability, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      total_visitors_this_month = excluded.total_visitors_this_month,
      avg_daily_visitors = excluded.avg_daily_visitors,
      avg_spend = excluded.avg_spend,
      avg_occupancy = excluded.avg_occupancy,
      total_revenue = excluded.total_revenue,
      avg_sustainability = excluded.avg_sustainability,
      updated_at = excluded.updated_at
  `);

  if (rawData.tourism_summary) {
    stats.tourism_summary.total = 1;
    const ts = rawData.tourism_summary;
    try {
      summaryStmt.run(
        'current-overview',
        Number(ts.totalVisitorsThisMonth) || 0,
        Number(ts.avgDailyVisitors) || 0,
        Number(ts.avgSpend) || 0,
        Number(ts.avgOccupancy) || 0,
        Number(ts.totalRevenue) || 0,
        Number(ts.avgSustainability) || 0,
        new Date().toISOString()
      );
      stats.tourism_summary.inserted++;
    } catch (err) {
      stats.tourism_summary.failed++;
      logError('tourism_summary', ts, err.message);
    }
  }

  db.exec('COMMIT;');
  console.log('Transaction committed successfully!\n');
} catch (txErr) {
  db.exec('ROLLBACK;');
  console.error('Fatal error during transaction. Rolled back.', txErr);
  process.exit(1);
}

console.log('================ COMPLETE IMPORT SUMMARY ================');
console.log(`Profiles:            ${stats.profiles.inserted}/${stats.profiles.total}`);
console.log(`Destinations:        ${stats.destinations.inserted}/${stats.destinations.total}`);
console.log(`Attractions:         ${stats.attractions.inserted}/${stats.attractions.total}`);
console.log(`Businesses:          ${stats.businesses.inserted}/${stats.businesses.total}`);
console.log(`Listings:            ${stats.listings.inserted}/${stats.listings.total}`);
console.log(`Inquiries:           ${stats.inquiries.inserted}/${stats.inquiries.total}`);
console.log(`Audit Logs:          ${stats.audit_logs.inserted}/${stats.audit_logs.total}`);
console.log(`Business Analytics:  ${stats.business_analytics.inserted}/${stats.business_analytics.total}`);
console.log(`Tourism Summary:     ${stats.tourism_summary.inserted}/${stats.tourism_summary.total}`);
console.log('=========================================================');
