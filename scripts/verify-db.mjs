import { DatabaseSync } from 'node:sqlite';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'data', 'travelpulse.db');
const db = new DatabaseSync(DB_FILE);

console.log('--- Database Verification ---');
const profiles = db.prepare('SELECT count(*) as count FROM profiles').get();
const businesses = db.prepare('SELECT count(*) as count FROM businesses').get();
const analytics = db.prepare('SELECT count(*) as count FROM business_analytics').get();
const summary = db.prepare('SELECT count(*) as count FROM tourism_summaries').get();

console.log(`Profiles in DB:           ${profiles.count}`);
console.log(`Businesses in DB:         ${businesses.count}`);
console.log(`Business Analytics in DB: ${analytics.count}`);
console.log(`Tourism Summary in DB:    ${summary.count}`);

console.log('\n--- Sample Business Analytics Query ---');
const sampleAnalytics = db.prepare('SELECT id, business_id, date, bookings, revenue, occupancy_pct, visitor_count FROM business_analytics ORDER BY date DESC LIMIT 3').all();
console.table(sampleAnalytics);

console.log('\n--- Sample Profiles Query ---');
const sampleProfiles = db.prepare('SELECT id, role, full_name, age_range, travel_style FROM profiles').all();
console.table(sampleProfiles);

console.log('\n--- Tourism Summary Query ---');
const sampleSummary = db.prepare('SELECT * FROM tourism_summaries').all();
console.table(sampleSummary);
