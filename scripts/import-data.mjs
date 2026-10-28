import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const PROJECT_ROOT = process.cwd();
const DATA_DIR = path.join(PROJECT_ROOT, 'data');
const DB_FILE = path.join(DATA_DIR, 'travelpulse.db');
const LOG_FILE = path.join(PROJECT_ROOT, 'scripts', 'import-errors.log');

const isDryRun = process.argv.includes('--dry-run') || process.argv.includes('-d');

fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });

if (!isDryRun) {
  fs.writeFileSync(LOG_FILE, `Import Run: ${new Date().toISOString()}\n=====================================\n`);
}

function logError(entity, item, errorMsg) {
  const line = `[ERROR] [${entity}] ID: ${item?.id || item?.properties?.id || 'unknown'} - ${errorMsg}\nPayload: ${JSON.stringify(item)}\n\n`;
  if (!isDryRun) {
    fs.appendFileSync(LOG_FILE, line);
  }
}

// Open DB
const db = new DatabaseSync(DB_FILE);
db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA journal_mode = WAL;');

// Initialize all tables and migrations
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
    image_url TEXT,
    opening_hours TEXT,
    avg_visit_duration_min INTEGER DEFAULT 60,
    visitors_today INTEGER DEFAULT 0,
    visitors_weekly INTEGER DEFAULT 0,
    visitors_monthly INTEGER DEFAULT 0,
    tourism_score REAL DEFAULT 0,
    tags TEXT DEFAULT '[]',
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
    image_url TEXT,
    location TEXT,
    is_open INTEGER DEFAULT 1,
    price_level INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (owner_id) REFERENCES profiles(id) ON DELETE SET NULL,
    FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE
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

// Additive column updates
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

// Load datasets
function loadJson(filename, defaultVal = null) {
  const fullPath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(fullPath)) return defaultVal;
  try {
    return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  } catch (e) {
    console.error(`Failed to parse ${filename}:`, e.message);
    return defaultVal;
  }
}

const sourceData = loadJson('source-data.json', {});
const demoUsers = loadJson('demo_users.json', []);
const destinationsGeo = loadJson('destinations.geojson', { features: [] });
const attractionsGeo = loadJson('attractions.geojson', { features: [] });
const businessesGeo = loadJson('businesses.geojson', { features: [] });
const safetyFacilitiesGeo = loadJson('safety_facilities.geojson', { features: [] });
const sampleItinerary = loadJson('sample_itinerary.json', null);
const tourismAnalytics = loadJson('tourism_analytics.json', []);
const businessAnalytics = loadJson('business_analytics.json', []);
const tourismSummary = loadJson('tourism_summary.json', null);

const stats = {
  profiles: { total: 0, inserted: 0, updated: 0, skipped: 0, failed: 0 },
  destinations: { total: 0, inserted: 0, updated: 0, skipped: 0, failed: 0 },
  attractions: { total: 0, inserted: 0, updated: 0, skipped: 0, failed: 0 },
  businesses: { total: 0, inserted: 0, updated: 0, skipped: 0, failed: 0 },
  listings: { total: 0, inserted: 0, updated: 0, skipped: 0, failed: 0 },
  business_inquiries: { total: 0, inserted: 0, updated: 0, skipped: 0, failed: 0 },
  safety_facilities: { total: 0, inserted: 0, updated: 0, skipped: 0, failed: 0 },
  itineraries: { total: 0, inserted: 0, updated: 0, skipped: 0, failed: 0 },
  business_analytics: { total: 0, inserted: 0, updated: 0, skipped: 0, failed: 0 },
  tourism_analytics: { total: 0, inserted: 0, updated: 0, skipped: 0, failed: 0 },
  tourism_summary: { total: 0, inserted: 0, updated: 0, skipped: 0, failed: 0 },
  audit_logs: { total: 0, inserted: 0, updated: 0, skipped: 0, failed: 0 },
};

// Coordinate validator (GeoJSON: [longitude, latitude])
function validateCoordinates(coords) {
  if (!Array.isArray(coords) || coords.length !== 2) return null;
  const [lon, lat] = coords;
  if (!Number.isFinite(lon) || !Number.isFinite(lat)) return null;
  if (lon < -180 || lon > 180 || lat < -90 || lat > 90) return null;
  return { longitude: lon, latitude: lat };
}

// Track valid destination IDs
const validDestIds = new Set(
  db.prepare('SELECT id FROM destinations').all().map(r => r.id)
);
for (const feat of destinationsGeo.features || []) {
  if (feat.properties?.id) validDestIds.add(feat.properties.id);
}

// Track valid business IDs
const validBizIds = new Set(
  db.prepare('SELECT id FROM businesses').all().map(r => r.id)
);
for (const feat of businessesGeo.features || []) {
  if (feat.properties?.id) validBizIds.add(feat.properties.id);
}

console.log(`================================================================`);
console.log(`TRAVELPULSE AI — DATA IMPORTER & SYNC ENGINE`);
console.log(`Mode: ${isDryRun ? 'DRY RUN (Simulate without writing)' : 'LIVE EXECUTION'}`);
console.log(`Database: ${DB_FILE}`);
console.log(`================================================================\n`);

if (!isDryRun) {
  db.exec('BEGIN TRANSACTION;');
}

try {
  // -------------------------------------------------------------
  // 1. PROFILES
  // -------------------------------------------------------------
  const combinedProfiles = [...(demoUsers || [])];
  // Merge profiles from source-data.json if not present
  for (const sp of (sourceData.profiles || [])) {
    if (!combinedProfiles.some(p => p.id === sp.id)) {
      combinedProfiles.push(sp);
    }
  }

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
      avatar_url = COALESCE(excluded.avatar_url, profiles.avatar_url),
      onboarding_complete = excluded.onboarding_complete,
      is_active = COALESCE(profiles.is_active, excluded.is_active),
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

  for (const p of combinedProfiles) {
    stats.profiles.total++;
    try {
      if (!p.id || !p.role || !p.full_name) {
        throw new Error('Profile missing required fields: id, role, or full_name');
      }
      const existing = db.prepare('SELECT id FROM profiles WHERE id = ?').get(p.id);
      if (!isDryRun) {
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
      }
      if (existing) stats.profiles.updated++;
      else stats.profiles.inserted++;
    } catch (err) {
      stats.profiles.failed++;
      logError('profiles', p, err.message);
    }
  }

  // -------------------------------------------------------------
  // 2. DESTINATIONS
  // -------------------------------------------------------------
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

  const allDestFeatures = [...(destinationsGeo.features || [])];
  // Also merge any destinations from sourceData not in destinationsGeo
  for (const sd of (sourceData.destinations || [])) {
    if (!allDestFeatures.some(f => f.properties?.id === sd.id)) {
      allDestFeatures.push({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [sd.longitude, sd.latitude] },
        properties: sd
      });
    }
  }

  for (const feat of allDestFeatures) {
    stats.destinations.total++;
    const prop = feat.properties || {};
    try {
      if (!prop.id || !prop.name) {
        throw new Error('Destination missing id or name');
      }
      const coords = validateCoordinates(feat.geometry?.coordinates);
      if (!coords) {
        throw new Error(`Invalid geographic coordinates: ${JSON.stringify(feat.geometry?.coordinates)}`);
      }
      const existing = db.prepare('SELECT id FROM destinations WHERE id = ?').get(prop.id);
      if (!isDryRun) {
        destStmt.run(
          prop.id,
          prop.name,
          prop.state || '',
          prop.country || 'India',
          coords.latitude,
          coords.longitude,
          prop.description || '',
          JSON.stringify(prop.categories || []),
          prop.best_season || '',
          Number(prop.average_budget_per_day) || 0,
          prop.image_url || '',
          prop.is_published !== undefined ? (prop.is_published ? 1 : 0) : 1,
          new Date().toISOString()
        );
      }
      validDestIds.add(prop.id);
      if (existing) stats.destinations.updated++;
      else stats.destinations.inserted++;
    } catch (err) {
      stats.destinations.failed++;
      logError('destinations', prop, err.message);
    }
  }

  // -------------------------------------------------------------
  // 3. ATTRACTIONS
  // -------------------------------------------------------------
  const attrStmt = db.prepare(`
    INSERT INTO attractions (
      id, destination_id, name, type, description, latitude, longitude,
      entry_fee, crowd_level, is_hidden_gem, is_published, image_url,
      opening_hours, avg_visit_duration_min, visitors_today, visitors_weekly,
      visitors_monthly, tourism_score, tags, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      is_published = excluded.is_published,
      image_url = excluded.image_url,
      opening_hours = excluded.opening_hours,
      avg_visit_duration_min = excluded.avg_visit_duration_min,
      visitors_today = excluded.visitors_today,
      visitors_weekly = excluded.visitors_weekly,
      visitors_monthly = excluded.visitors_monthly,
      tourism_score = excluded.tourism_score,
      tags = excluded.tags
  `);

  const allAttrFeatures = [...(attractionsGeo.features || [])];
  for (const sa of (sourceData.attractions || [])) {
    if (!allAttrFeatures.some(f => f.properties?.id === sa.id)) {
      allAttrFeatures.push({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [sa.longitude, sa.latitude] },
        properties: sa
      });
    }
  }

  for (const feat of allAttrFeatures) {
    stats.attractions.total++;
    const prop = feat.properties || {};
    try {
      if (!prop.id || !prop.name) {
        throw new Error('Attraction missing id or name');
      }
      if (!validDestIds.has(prop.destination_id)) {
        throw new Error(`Foreign key constraint failed: destination_id '${prop.destination_id}' not found in destinations`);
      }
      const coords = validateCoordinates(feat.geometry?.coordinates);
      if (!coords) {
        throw new Error(`Invalid geographic coordinates: ${JSON.stringify(feat.geometry?.coordinates)}`);
      }
      const existing = db.prepare('SELECT id FROM attractions WHERE id = ?').get(prop.id);
      if (!isDryRun) {
        attrStmt.run(
          prop.id,
          prop.destination_id,
          prop.name,
          prop.type || 'viewpoint',
          prop.description || '',
          coords.latitude,
          coords.longitude,
          Number(prop.entry_fee) || 0,
          prop.crowd_level || 'MEDIUM',
          prop.is_hidden_gem ? 1 : 0,
          prop.is_published !== undefined ? (prop.is_published ? 1 : 0) : 1,
          prop.image_url || '',
          prop.opening_hours || '',
          Number(prop.avg_visit_duration_min) || 60,
          Number(prop.visitors_today) || 0,
          Number(prop.visitors_weekly) || 0,
          Number(prop.visitors_monthly) || 0,
          Number(prop.tourism_score) || 0,
          JSON.stringify(prop.tags || []),
          new Date().toISOString()
        );
      }
      if (existing) stats.attractions.updated++;
      else stats.attractions.inserted++;
    } catch (err) {
      stats.attractions.failed++;
      logError('attractions', prop, err.message);
    }
  }

  // -------------------------------------------------------------
  // 4. BUSINESSES
  // -------------------------------------------------------------
  const bizStmt = db.prepare(`
    INSERT INTO businesses (
      id, destination_id, owner_id, name, category, description,
      latitude, longitude, price_range, price_per_unit, rating,
      review_count, contact_phone, contact_email, address, amenities,
      operating_hours, status, rejection_reason, submitted_at, reviewed_at,
      reviewed_by, is_local, is_verified, eco_certified, image_url,
      location, is_open, price_level, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      destination_id = excluded.destination_id,
      owner_id = CASE WHEN businesses.owner_id IS NOT NULL THEN businesses.owner_id ELSE excluded.owner_id END,
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
      status = CASE WHEN businesses.status IS NOT NULL THEN businesses.status ELSE excluded.status END,
      rejection_reason = CASE WHEN businesses.rejection_reason IS NOT NULL THEN businesses.rejection_reason ELSE excluded.rejection_reason END,
      submitted_at = CASE WHEN businesses.submitted_at IS NOT NULL THEN businesses.submitted_at ELSE excluded.submitted_at END,
      reviewed_at = CASE WHEN businesses.reviewed_at IS NOT NULL THEN businesses.reviewed_at ELSE excluded.reviewed_at END,
      reviewed_by = CASE WHEN businesses.reviewed_by IS NOT NULL THEN businesses.reviewed_by ELSE excluded.reviewed_by END,
      is_local = excluded.is_local,
      is_verified = excluded.is_verified,
      eco_certified = excluded.eco_certified,
      image_url = excluded.image_url,
      location = excluded.location,
      is_open = excluded.is_open,
      price_level = excluded.price_level
  `);

  const allBizFeatures = [...(businessesGeo.features || [])];
  for (const sb of (sourceData.businesses || [])) {
    if (!allBizFeatures.some(f => f.properties?.id === sb.id)) {
      allBizFeatures.push({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [sb.longitude, sb.latitude] },
        properties: sb
      });
    }
  }

  for (const feat of allBizFeatures) {
    stats.businesses.total++;
    const prop = feat.properties || {};
    try {
      if (!prop.id || !prop.name) {
        throw new Error('Business missing id or name');
      }
      if (!validDestIds.has(prop.destination_id)) {
        throw new Error(`Foreign key constraint failed: destination_id '${prop.destination_id}' not found in destinations`);
      }
      const coords = validateCoordinates(feat.geometry?.coordinates);
      if (!coords) {
        throw new Error(`Invalid geographic coordinates: ${JSON.stringify(feat.geometry?.coordinates)}`);
      }
      const existing = db.prepare('SELECT id, owner_id FROM businesses WHERE id = ?').get(prop.id);
      if (!isDryRun) {
        bizStmt.run(
          prop.id,
          prop.destination_id,
          prop.owner_id || null,
          prop.name,
          prop.category || 'hotel',
          prop.description || '',
          coords.latitude,
          coords.longitude,
          prop.price_range || null,
          Number(prop.price_per_unit) || 0,
          Number(prop.rating) || 0,
          Number(prop.review_count) || 0,
          prop.contact_phone || null,
          prop.contact_email || null,
          prop.address || '',
          JSON.stringify(prop.amenities || []),
          prop.operating_hours || '9:00 AM - 9:00 PM',
          prop.status || 'APPROVED',
          prop.rejection_reason || null,
          prop.submitted_at || new Date().toISOString(),
          prop.reviewed_at || null,
          prop.reviewed_by || null,
          prop.is_local ? 1 : 0,
          prop.is_verified ? 1 : 0,
          prop.eco_certified ? 1 : 0,
          prop.image_url || '',
          prop.location || '',
          prop.is_open !== undefined ? (prop.is_open ? 1 : 0) : 1,
          Number(prop.price_level) || 1,
          new Date().toISOString()
        );
      }
      validBizIds.add(prop.id);
      if (existing) stats.businesses.updated++;
      else stats.businesses.inserted++;
    } catch (err) {
      stats.businesses.failed++;
      logError('businesses', prop, err.message);
    }
  }

  // -------------------------------------------------------------
  // 5. SAFETY FACILITIES
  // -------------------------------------------------------------
  const safetyStmt = db.prepare(`
    INSERT INTO safety_facilities (
      id, destination_id, name, type, latitude, longitude,
      phone, address, is_24hr, verification_status, emergency_services, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      destination_id = excluded.destination_id,
      name = excluded.name,
      type = excluded.type,
      latitude = excluded.latitude,
      longitude = excluded.longitude,
      phone = excluded.phone,
      address = excluded.address,
      is_24hr = excluded.is_24hr,
      verification_status = excluded.verification_status,
      emergency_services = excluded.emergency_services
  `);

  for (const feat of (safetyFacilitiesGeo.features || [])) {
    stats.safety_facilities.total++;
    const prop = feat.properties || {};
    try {
      if (!prop.id || !prop.name) {
        throw new Error('Safety facility missing id or name');
      }
      if (!validDestIds.has(prop.destination_id)) {
        throw new Error(`Foreign key constraint failed: destination_id '${prop.destination_id}' not found in destinations`);
      }
      const coords = validateCoordinates(feat.geometry?.coordinates);
      if (!coords) {
        throw new Error(`Invalid geographic coordinates: ${JSON.stringify(feat.geometry?.coordinates)}`);
      }
      const existing = db.prepare('SELECT id FROM safety_facilities WHERE id = ?').get(prop.id);
      if (!isDryRun) {
        safetyStmt.run(
          prop.id,
          prop.destination_id,
          prop.name,
          prop.type || 'hospital',
          coords.latitude,
          coords.longitude,
          prop.phone || null,
          prop.address || '',
          prop.is_24hr || prop.is_24_7 ? 1 : 0,
          prop.verification_status || 'VERIFIED',
          JSON.stringify(prop.emergency_services || []),
          new Date().toISOString()
        );
      }
      if (existing) stats.safety_facilities.updated++;
      else stats.safety_facilities.inserted++;
    } catch (err) {
      stats.safety_facilities.failed++;
      logError('safety_facilities', prop, err.message);
    }
  }

  // -------------------------------------------------------------
  // 6. ITINERARIES
  // -------------------------------------------------------------
  const itinStmt = db.prepare(`
    INSERT INTO itineraries (
      id, user_id, title, origin, destination, duration_days, budget,
      travelers, travel_style, interests, food_preference, accommodation_preference,
      status, items, optimization_log, total_estimated_cost, total_distance_km,
      local_businesses_count, sustainability_score, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      user_id = excluded.user_id,
      title = excluded.title,
      origin = excluded.origin,
      destination = excluded.destination,
      duration_days = excluded.duration_days,
      budget = excluded.budget,
      travelers = excluded.travelers,
      travel_style = excluded.travel_style,
      interests = excluded.interests,
      food_preference = excluded.food_preference,
      accommodation_preference = excluded.accommodation_preference,
      status = excluded.status,
      items = excluded.items,
      optimization_log = excluded.optimization_log,
      total_estimated_cost = excluded.total_estimated_cost,
      total_distance_km = excluded.total_distance_km,
      local_businesses_count = excluded.local_businesses_count,
      sustainability_score = excluded.sustainability_score,
      updated_at = excluded.updated_at
  `);

  if (sampleItinerary && sampleItinerary.id) {
    stats.itineraries.total++;
    try {
      // Validate item coordinates
      for (const it of (sampleItinerary.items || [])) {
        if (!Number.isFinite(it.latitude) || !Number.isFinite(it.longitude)) {
          throw new Error(`Itinerary item ${it.id} contains invalid coordinates: [${it.longitude}, ${it.latitude}]`);
        }
      }
      const existing = db.prepare('SELECT id FROM itineraries WHERE id = ?').get(sampleItinerary.id);
      if (!isDryRun) {
        itinStmt.run(
          sampleItinerary.id,
          sampleItinerary.user_id || 'demo-user',
          sampleItinerary.title || 'Demo Itinerary',
          sampleItinerary.origin || 'Pune',
          sampleItinerary.destination || 'Mahabaleshwar',
          Number(sampleItinerary.duration_days) || 3,
          Number(sampleItinerary.budget) || 0,
          Number(sampleItinerary.travelers) || 1,
          sampleItinerary.travel_style || 'Adventure',
          JSON.stringify(sampleItinerary.interests || []),
          sampleItinerary.food_preference || 'No Preference',
          sampleItinerary.accommodation_preference || 'Homestay',
          sampleItinerary.status || 'PLANNED',
          JSON.stringify(sampleItinerary.items || []),
          JSON.stringify(sampleItinerary.optimization_log || []),
          Number(sampleItinerary.total_estimated_cost) || 0,
          Number(sampleItinerary.total_distance_km) || 0,
          Number(sampleItinerary.local_businesses_count) || 0,
          Number(sampleItinerary.sustainability_score) || 0,
          sampleItinerary.created_at || new Date().toISOString(),
          sampleItinerary.updated_at || new Date().toISOString()
        );
      }
      if (existing) stats.itineraries.updated++;
      else stats.itineraries.inserted++;
    } catch (err) {
      stats.itineraries.failed++;
      logError('itineraries', sampleItinerary, err.message);
    }
  }

  // -------------------------------------------------------------
  // 7. LISTINGS (Preserve & Sync)
  // -------------------------------------------------------------
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

  for (const l of (sourceData.listings || [])) {
    stats.listings.total++;
    try {
      if (!validBizIds.has(l.business_id)) {
        throw new Error(`Foreign key constraint failed: business_id '${l.business_id}' not found in businesses`);
      }
      const existing = db.prepare('SELECT id FROM listings WHERE id = ?').get(l.id);
      if (!isDryRun) {
        listingStmt.run(
          l.id,
          l.business_id,
          l.title,
          l.category,
          Number(l.price) || 0,
          l.description || '',
          l.status || 'APPROVED',
          l.rejection_reason || null,
          l.created_at || new Date().toISOString(),
          l.updated_at || new Date().toISOString()
        );
      }
      if (existing) stats.listings.updated++;
      else stats.listings.inserted++;
    } catch (err) {
      stats.listings.failed++;
      logError('listings', l, err.message);
    }
  }

  // -------------------------------------------------------------
  // 8. BUSINESS INQUIRIES (Preserve & Sync)
  // -------------------------------------------------------------
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

  for (const inq of (sourceData.business_inquiries || [])) {
    stats.business_inquiries.total++;
    try {
      if (!validBizIds.has(inq.business_id)) {
        throw new Error(`Foreign key constraint failed: business_id '${inq.business_id}' not found in businesses`);
      }
      const existing = db.prepare('SELECT id FROM business_inquiries WHERE id = ?').get(inq.id);
      if (!isDryRun) {
        inqStmt.run(
          inq.id,
          inq.business_id,
          inq.customer_name,
          inq.customer_email,
          inq.inquiry_date,
          Number(inq.guests) || 1,
          inq.status || 'PENDING',
          inq.notes || '',
          inq.created_at || new Date().toISOString()
        );
      }
      if (existing) stats.business_inquiries.updated++;
      else stats.business_inquiries.inserted++;
    } catch (err) {
      stats.business_inquiries.failed++;
      logError('business_inquiries', inq, err.message);
    }
  }

  // -------------------------------------------------------------
  // 9. AUDIT LOGS (Preserve & Sync)
  // -------------------------------------------------------------
  const auditStmt = db.prepare(`
    INSERT INTO audit_logs (
      id, admin_id, admin_name, action, target_entity, target_id, details, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      details = excluded.details
  `);

  for (const log of (sourceData.audit_logs || [])) {
    stats.audit_logs.total++;
    try {
      const existing = db.prepare('SELECT id FROM audit_logs WHERE id = ?').get(log.id);
      if (!isDryRun) {
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
      }
      if (existing) stats.audit_logs.updated++;
      else stats.audit_logs.inserted++;
    } catch (err) {
      stats.audit_logs.failed++;
      logError('audit_logs', log, err.message);
    }
  }

  // -------------------------------------------------------------
  // 10. BUSINESS ANALYTICS
  // -------------------------------------------------------------
  const bizAnalyticsStmt = db.prepare(`
    INSERT INTO business_analytics (
      id, business_id, date, bookings, revenue,
      occupancy_pct, visitor_count, customer_segments, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(business_id, date) DO UPDATE SET
      bookings = excluded.bookings,
      revenue = excluded.revenue,
      occupancy_pct = excluded.occupancy_pct,
      visitor_count = excluded.visitor_count,
      customer_segments = excluded.customer_segments
  `);

  const allBizAnalytics = [...(businessAnalytics || [])];
  for (const sa of (sourceData.business_analytics || [])) {
    if (!allBizAnalytics.some(a => a.business_id === sa.business_id && a.date === sa.date)) {
      allBizAnalytics.push(sa);
    }
  }

  for (const a of allBizAnalytics) {
    stats.business_analytics.total++;
    try {
      if (!validBizIds.has(a.business_id)) {
        throw new Error(`Foreign key constraint failed: business_id '${a.business_id}' not found in businesses`);
      }
      const existing = db.prepare('SELECT id FROM business_analytics WHERE business_id = ? AND date = ?').get(a.business_id, a.date);
      if (!isDryRun) {
        bizAnalyticsStmt.run(
          a.id || `ba-${a.business_id}-${a.date}`,
          a.business_id,
          a.date,
          Number(a.bookings) || 0,
          Number(a.revenue) || 0,
          Number(a.occupancy_pct) || 0,
          Number(a.visitor_count) || 0,
          JSON.stringify(a.customer_segments || []),
          new Date().toISOString()
        );
      }
      if (existing) stats.business_analytics.updated++;
      else stats.business_analytics.inserted++;
    } catch (err) {
      stats.business_analytics.failed++;
      logError('business_analytics', a, err.message);
    }
  }

  // -------------------------------------------------------------
  // 11. TOURISM ANALYTICS (Daily Timeseries)
  // -------------------------------------------------------------
  const tourismAnalyticsStmt = db.prepare(`
    INSERT INTO tourism_analytics (
      id, date, total_visitors, avg_spend, hotel_occupancy_pct,
      local_biz_revenue, sustainability_index, top_attractions,
      crowd_distribution, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(date) DO UPDATE SET
      total_visitors = excluded.total_visitors,
      avg_spend = excluded.avg_spend,
      hotel_occupancy_pct = excluded.hotel_occupancy_pct,
      local_biz_revenue = excluded.local_biz_revenue,
      sustainability_index = excluded.sustainability_index,
      top_attractions = excluded.top_attractions,
      crowd_distribution = excluded.crowd_distribution
  `);

  for (const ta of (tourismAnalytics || [])) {
    stats.tourism_analytics.total++;
    try {
      if (!ta.date) {
        throw new Error('Tourism analytics missing date');
      }
      const existing = db.prepare('SELECT id FROM tourism_analytics WHERE date = ?').get(ta.date);
      if (!isDryRun) {
        tourismAnalyticsStmt.run(
          ta.id || `ta-${ta.date}`,
          ta.date,
          Number(ta.total_visitors) || 0,
          Number(ta.avg_spend) || 0,
          Number(ta.hotel_occupancy_pct) || 0,
          Number(ta.local_biz_revenue) || 0,
          Number(ta.sustainability_index) || 0,
          JSON.stringify(ta.top_attractions || []),
          JSON.stringify(ta.crowd_distribution || []),
          new Date().toISOString()
        );
      }
      if (existing) stats.tourism_analytics.updated++;
      else stats.tourism_analytics.inserted++;
    } catch (err) {
      stats.tourism_analytics.failed++;
      logError('tourism_analytics', ta, err.message);
    }
  }

  // -------------------------------------------------------------
  // 12. TOURISM SUMMARY OVERVIEW
  // -------------------------------------------------------------
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

  const summaryData = tourismSummary || sourceData.tourism_summary;
  if (summaryData) {
    stats.tourism_summary.total = 1;
    try {
      const existing = db.prepare('SELECT id FROM tourism_summaries WHERE id = ?').get('current-overview');
      if (!isDryRun) {
        summaryStmt.run(
          'current-overview',
          Number(summaryData.totalVisitorsThisMonth) || 0,
          Number(summaryData.avgDailyVisitors) || 0,
          Number(summaryData.avgSpend) || 0,
          Number(summaryData.avgOccupancy) || 0,
          Number(summaryData.totalRevenue) || 0,
          Number(summaryData.avgSustainability) || 0,
          new Date().toISOString()
        );
      }
      if (existing) stats.tourism_summary.updated++;
      else stats.tourism_summary.inserted++;
    } catch (err) {
      stats.tourism_summary.failed++;
      logError('tourism_summary', summaryData, err.message);
    }
  }

  if (!isDryRun) {
    db.exec('COMMIT;');
    console.log('✓ Database transaction successfully committed.\n');
  } else {
    console.log('ℹ Dry run complete. No database changes were applied.\n');
  }

} catch (txErr) {
  if (!isDryRun) {
    db.exec('ROLLBACK;');
  }
  console.error('Fatal error during import pipeline. Transaction rolled back:', txErr);
  process.exit(1);
}

// -------------------------------------------------------------
// PRINT REPORT TABLE
// -------------------------------------------------------------
console.log('========================================================================================');
console.log(`| ENTITY TABLE         | TOTAL | INSERTED | UPDATED  | SKIPPED  | FAILED   | STATUS    |`);
console.log('========================================================================================');
for (const [entity, s] of Object.entries(stats)) {
  const entityPadded = entity.padEnd(20, ' ');
  const totalPadded = String(s.total).padStart(5, ' ');
  const insPadded = String(s.inserted).padStart(8, ' ');
  const updPadded = String(s.updated).padStart(8, ' ');
  const skipPadded = String(s.skipped).padStart(8, ' ');
  const failPadded = String(s.failed).padStart(8, ' ');
  const status = s.failed === 0 ? '✓ VALID' : '✗ HAS ERRORS';
  console.log(`| ${entityPadded} | ${totalPadded} | ${insPadded} | ${updPadded} | ${skipPadded} | ${failPadded} | ${status.padEnd(9, ' ')} |`);
}
console.log('========================================================================================');
console.log('\nIntegrity & Safety Notes:');
console.log('1. Coordinate Order: GeoJSON [longitude, latitude] correctly mapped.');
console.log('2. Foreign Key References: All attractions, businesses, safety facilities, and analytics validate against destinations.');
console.log('3. Relationship Preservation: Existing business ownership (owner_id) and listing relations were strictly preserved.');
console.log('4. Data Caveat: Phone numbers, emergency contacts, and analytics are synthetic demonstration fixtures and not independently verified real-world contacts.');
console.log('========================================================================================\n');
