import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

const dbPath = path.join(process.cwd(), 'data', 'travelpulse.db');
const db = new DatabaseSync(dbPath);

console.log('=== VERIFYING IMPORTED DATA ACCESSIBILITY IN APPLICATION ===\n');

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✓ PASSED: ${message}`);
  }
}

// 1. Destinations verification
const destinations = db.prepare('SELECT * FROM destinations ORDER BY name ASC').all();
assert(destinations.length >= 15, `Destinations count should be at least 15 (got ${destinations.length})`);
const mDest = destinations.find(d => d.id === 'dest-mahabaleshwar');
assert(Boolean(mDest), 'dest-mahabaleshwar found in database');
assert(Number(mDest.latitude) === 17.9237, 'dest-mahabaleshwar latitude matches 17.9237');

// 2. Attractions verification
const attractions = db.prepare('SELECT * FROM attractions WHERE destination_id = ?').all('dest-mahabaleshwar');
assert(attractions.length >= 15, `Mahabaleshwar attractions should be >= 15 (got ${attractions.length})`);
const vennaLake = attractions.find(a => a.id === 'attr-001' || a.id === 'attr-venna-lake');
assert(Boolean(vennaLake), 'Venna Lake attraction found');

// 3. Businesses verification & owner preservation
const businesses = db.prepare('SELECT * FROM businesses').all();
assert(businesses.length >= 22, `Total businesses should be at least 22 (got ${businesses.length})`);
const biz1 = db.prepare('SELECT * FROM businesses WHERE id = ?').get('biz-001');
assert(Boolean(biz1), 'biz-001 found');
assert(biz1.owner_id === 'demo-business-001', `biz-001 owner_id must be 'demo-business-001' (got ${biz1.owner_id})`);
assert(biz1.status === 'APPROVED', `biz-001 status must remain 'APPROVED' (got ${biz1.status})`);

// 4. Listings and inquiries preservation
const listings = db.prepare('SELECT * FROM listings WHERE business_id = ?').all('biz-001');
assert(listings.length >= 4, `biz-001 listings should be preserved (got ${listings.length})`);
const inquiries = db.prepare('SELECT * FROM business_inquiries WHERE business_id = ?').all('biz-001');
assert(inquiries.length >= 4, `biz-001 inquiries should be preserved (got ${inquiries.length})`);

// 5. Safety facilities verification
const safety = db.prepare('SELECT * FROM safety_facilities WHERE destination_id = ?').all('dest-mahabaleshwar');
assert(safety.length >= 6, `Mahabaleshwar safety facilities should be >= 6 (got ${safety.length})`);
const hospital = safety.find(s => s.id === 'safe-001');
assert(Boolean(hospital), 'Mahabaleshwar Rural Hospital found');
assert(hospital.phone === '+91 2168 260208', 'Hospital phone matches');

// 6. Itineraries verification
const itin = db.prepare('SELECT * FROM itineraries WHERE id = ?').get('itin-demo-001');
assert(Boolean(itin), 'itin-demo-001 found in itineraries table');
const itinItems = JSON.parse(itin.items);
assert(itinItems.length === 17, `Itinerary items count should be 17 (got ${itinItems.length})`);

// 7. Tourism & Business Analytics verification
const tourismAnalytics = db.prepare('SELECT * FROM tourism_analytics').all();
assert(tourismAnalytics.length === 30, `Tourism analytics count should be 30 (got ${tourismAnalytics.length})`);
const bizAnalytics = db.prepare('SELECT * FROM business_analytics WHERE business_id = ?').all('biz-001');
assert(bizAnalytics.length === 30, `Business analytics count for biz-001 should be 30 (got ${bizAnalytics.length})`);

// 8. Profiles & Auth verification
const admin = db.prepare('SELECT * FROM profiles WHERE id = ?').get('demo-admin-001');
assert(Boolean(admin) && admin.role === 'ADMIN', 'Admin profile demo-admin-001 preserved with role ADMIN');

console.log('\n🎉 ALL APPLICATION DATABASE VERIFICATIONS COMPLETED SUCCESSFULLY!\n');
