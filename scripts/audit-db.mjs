import { DatabaseSync } from 'node:sqlite';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'data', 'travelpulse.db');
const db = new DatabaseSync(DB_FILE);

console.log('=== DATABASE AUDIT REPORT ===');
const tables = db.prepare(`SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'`).all();
console.log(`Found ${tables.length} tables:`);
for (const t of tables) {
  const count = db.prepare(`SELECT count(*) as c FROM ${t.name}`).get().c;
  console.log(`\nTable: [${t.name}] (${count} rows)`);
  console.log(t.sql);
}

console.log('\n=== REGISTERED PROFILES ===');
const profiles = db.prepare('SELECT id, role, full_name, onboarding_complete FROM profiles').all();
console.table(profiles);

console.log('\n=== REGISTERED BUSINESSES ===');
const businesses = db.prepare('SELECT id, name, owner_id, destination_id, is_verified, eco_certified FROM businesses').all();
console.table(businesses);
