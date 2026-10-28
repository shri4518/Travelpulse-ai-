import { DatabaseSync } from 'node:sqlite';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'data', 'travelpulse.db');
const db = new DatabaseSync(DB_FILE);

console.log('====================================================');
console.log('TRAVELPULSE AI — INTEGRATION & VERIFICATION TEST SUITE');
console.log('====================================================\n');

let passed = 0;
let failed = 0;

function assert(description, condition, details = '') {
  if (condition) {
    console.log(`[PASS] ${description}`);
    passed++;
  } else {
    console.error(`[FAIL] ${description} ${details ? `(${details})` : ''}`);
    failed++;
  }
}

// Test 1: Profiles in DB
const profiles = db.prepare('SELECT id, role, full_name, is_active FROM profiles').all();
assert('Profiles table contains required roles (TOURIST, BUSINESS, AUTHORITY, ADMIN)', 
  profiles.some(p => p.role === 'TOURIST') &&
  profiles.some(p => p.role === 'BUSINESS') &&
  profiles.some(p => p.role === 'AUTHORITY') &&
  profiles.some(p => p.role === 'ADMIN'),
  `Found roles: ${profiles.map(p => p.role).join(', ')}`
);

// Test 2: Business Profile ownership
const biz001 = db.prepare('SELECT * FROM businesses WHERE id = ?').get('biz-001');
assert('Business biz-001 is owned by demo-business-001', biz001?.owner_id === 'demo-business-001', `Owner: ${biz001?.owner_id}`);

// Test 3: Business Analytics 30-day data preserved
const analyticsCount = db.prepare('SELECT count(*) as count FROM business_analytics WHERE business_id = ?').get('biz-001').count;
assert('Business Analytics maintains all 30 days of metrics', analyticsCount === 30, `Count: ${analyticsCount}`);

// Test 4: Listings table
const listings = db.prepare('SELECT * FROM listings WHERE business_id = ?').all('biz-001');
assert('Listings table contains packages for biz-001', listings.length >= 4, `Listings count: ${listings.length}`);

// Test 5: Inquiries table
const inquiries = db.prepare('SELECT * FROM business_inquiries WHERE business_id = ?').all('biz-001');
assert('Inquiries table contains customer bookings for biz-001', inquiries.length >= 4, `Inquiries count: ${inquiries.length}`);

// Test 6: Status update on inquiry
db.prepare('UPDATE business_inquiries SET status = ? WHERE id = ?').run('CONFIRMED', 'inq-002');
const updatedInq = db.prepare('SELECT status FROM business_inquiries WHERE id = ?').get('inq-002');
assert('Inquiry status transitions to CONFIRMED and persists', updatedInq?.status === 'CONFIRMED', `Status: ${updatedInq?.status}`);

// Test 7: Approval Queue: Pending businesses exist
const pendingBiz = db.prepare('SELECT * FROM businesses WHERE status = ?').all('PENDING');
assert('Pending verification queue contains businesses for administrator review', pendingBiz.length >= 1, `Pending count: ${pendingBiz.length}`);

// Test 8: Destinations table
const destinations = db.prepare('SELECT * FROM destinations').all();
assert('Destinations table is populated with Indian destinations', destinations.length >= 5, `Destinations count: ${destinations.length}`);

// Test 9: Attractions table
const attractions = db.prepare('SELECT * FROM attractions').all();
assert('Attractions table is populated with attractions', attractions.length >= 5, `Attractions count: ${attractions.length}`);

// Test 10: Audit Log entry recording
const auditLogs = db.prepare('SELECT * FROM audit_logs').all();
assert('Audit logs table tracks administrative actions', auditLogs.length >= 3, `Logs count: ${auditLogs.length}`);

// Test 11: Tourism summary data
const summary = db.prepare('SELECT * FROM tourism_summaries WHERE id = ?').get('current-overview');
assert('Tourism summary maintains exact monthly visitors (153,131)', summary?.total_visitors_this_month === 153131, `Visitors: ${summary?.total_visitors_this_month}`);

console.log('\n====================================================');
console.log(`TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
console.log('====================================================');

if (failed > 0) {
  process.exit(1);
}
