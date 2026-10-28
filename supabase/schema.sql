-- ============================================================
-- TravelPulse AI — Complete Schema Migration
-- Compatible with Supabase / PostgreSQL
-- ============================================================

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('TOURIST', 'BUSINESS', 'AUTHORITY', 'ADMIN')),
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  onboarding_complete BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  age_range TEXT,
  travel_group TEXT,
  budget_preference TEXT,
  preferred_destinations JSONB DEFAULT '[]'::jsonb,
  travel_style TEXT,
  interests JSONB DEFAULT '[]'::jsonb,
  food_preferences JSONB DEFAULT '[]'::jsonb,
  adventure_preference TEXT,
  accommodation_preference TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Destinations Table
CREATE TABLE IF NOT EXISTS destinations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  state TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'India',
  latitude NUMERIC(10, 6) NOT NULL,
  longitude NUMERIC(10, 6) NOT NULL,
  description TEXT,
  categories JSONB DEFAULT '[]'::jsonb,
  best_season TEXT,
  average_budget_per_day NUMERIC(10, 2) DEFAULT 0,
  image_url TEXT,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Attractions Table
CREATE TABLE IF NOT EXISTS attractions (
  id TEXT PRIMARY KEY,
  destination_id TEXT NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  latitude NUMERIC(10, 6) NOT NULL,
  longitude NUMERIC(10, 6) NOT NULL,
  image_url TEXT,
  opening_hours TEXT,
  entry_fee NUMERIC(10, 2) DEFAULT 0,
  avg_visit_duration_min INTEGER DEFAULT 60,
  crowd_level TEXT DEFAULT 'MEDIUM',
  visitors_today INTEGER DEFAULT 0,
  visitors_weekly INTEGER DEFAULT 0,
  visitors_monthly INTEGER DEFAULT 0,
  tourism_score NUMERIC(3, 1) DEFAULT 0,
  tags JSONB DEFAULT '[]'::jsonb,
  is_hidden_gem BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Businesses Table
CREATE TABLE IF NOT EXISTS businesses (
  id TEXT PRIMARY KEY,
  destination_id TEXT NOT NULL,
  owner_id TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  latitude NUMERIC(10, 6),
  longitude NUMERIC(10, 6),
  image_url TEXT,
  location TEXT,
  price_range TEXT,
  price_per_unit NUMERIC(10, 2) DEFAULT 0,
  price_level INTEGER DEFAULT 1,
  rating NUMERIC(3, 2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  contact_phone TEXT,
  contact_email TEXT,
  address TEXT,
  amenities JSONB DEFAULT '[]'::jsonb,
  operating_hours TEXT,
  is_open BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'APPROVED' CHECK (status IN ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED')),
  rejection_reason TEXT,
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT,
  is_local BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  eco_certified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Listings Table
CREATE TABLE IF NOT EXISTS listings (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  description TEXT,
  status TEXT DEFAULT 'APPROVED' CHECK (status IN ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED')),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Business Inquiries / Bookings Table
CREATE TABLE IF NOT EXISTS business_inquiries (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  inquiry_date DATE NOT NULL,
  guests INTEGER DEFAULT 1,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  admin_id TEXT NOT NULL,
  admin_name TEXT NOT NULL,
  action TEXT NOT NULL,
  target_entity TEXT NOT NULL,
  target_id TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Business Daily Analytics
CREATE TABLE IF NOT EXISTS business_analytics (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  bookings INTEGER NOT NULL DEFAULT 0,
  revenue NUMERIC(12, 2) NOT NULL DEFAULT 0,
  occupancy_pct INTEGER NOT NULL DEFAULT 0,
  visitor_count INTEGER NOT NULL DEFAULT 0,
  customer_segments JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_biz_analytics_date UNIQUE (business_id, date)
);

CREATE INDEX IF NOT EXISTS idx_biz_analytics_date ON business_analytics(business_id, date DESC);

-- 9. Tourism Summaries / Overview
CREATE TABLE IF NOT EXISTS tourism_summaries (
  id TEXT PRIMARY KEY DEFAULT 'current-overview',
  total_visitors_this_month INTEGER NOT NULL,
  avg_daily_visitors INTEGER NOT NULL,
  avg_spend NUMERIC(10, 2) NOT NULL,
  avg_occupancy INTEGER NOT NULL,
  total_revenue NUMERIC(14, 2) NOT NULL,
  avg_sustainability NUMERIC(4, 1) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 10. Safety Facilities Table
CREATE TABLE IF NOT EXISTS safety_facilities (
  id TEXT PRIMARY KEY,
  destination_id TEXT NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  latitude NUMERIC(10, 6) NOT NULL,
  longitude NUMERIC(10, 6) NOT NULL,
  phone TEXT,
  address TEXT,
  is_24hr BOOLEAN DEFAULT true,
  verification_status TEXT DEFAULT 'VERIFIED',
  emergency_services JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 11. Itineraries Table
CREATE TABLE IF NOT EXISTS itineraries (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  duration_days INTEGER NOT NULL,
  budget NUMERIC(10, 2) NOT NULL,
  travelers INTEGER DEFAULT 1,
  travel_style TEXT,
  interests JSONB DEFAULT '[]'::jsonb,
  food_preference TEXT,
  accommodation_preference TEXT,
  status TEXT DEFAULT 'PLANNED',
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  optimization_log JSONB DEFAULT '[]'::jsonb,
  total_estimated_cost NUMERIC(10, 2) DEFAULT 0,
  total_distance_km NUMERIC(10, 2) DEFAULT 0,
  local_businesses_count INTEGER DEFAULT 0,
  sustainability_score NUMERIC(4, 1) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 12. Tourism Analytics (Daily Timeseries)
CREATE TABLE IF NOT EXISTS tourism_analytics (
  id TEXT PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  total_visitors INTEGER NOT NULL DEFAULT 0,
  avg_spend NUMERIC(10, 2) NOT NULL DEFAULT 0,
  hotel_occupancy_pct INTEGER NOT NULL DEFAULT 0,
  local_biz_revenue NUMERIC(14, 2) NOT NULL DEFAULT 0,
  sustainability_index NUMERIC(4, 1) NOT NULL DEFAULT 0,
  top_attractions JSONB DEFAULT '[]'::jsonb,
  crowd_distribution JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

