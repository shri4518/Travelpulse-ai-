// ============================================================
// TravelPulse AI — Constants & Configuration
// ============================================================

export const APP_NAME = 'TravelPulse AI';
export const APP_TAGLINE = 'Intelligent Tourism. Connected Experiences. Stronger Local Economies.';
export const APP_DESCRIPTION = 'Plan smarter journeys, discover local experiences and help destinations grow sustainably.';

// Destinations are now dynamic, see seed-destinations.ts

// Design tokens
export const COLORS = {
  forest: '#1B4332',
  forestLight: '#2D6A4F',
  forestMuted: '#40916C',
  mountain: '#374151',
  mountainLight: '#6B7280',
  sky: '#0EA5E9',
  skyLight: '#7DD3FC',
  skyDark: '#0369A1',
  sand: '#D4A574',
  sandLight: '#F5E6D3',
  sandDark: '#B8860B',
  white: '#FAFAFA',
  bg: '#0F172A',
  bgCard: '#1E293B',
  bgSurface: '#0F172A',
} as const;

// Role labels
export const ROLE_LABELS: Record<string, string> = {
  TOURIST: 'Tourist',
  BUSINESS: 'Business Owner',
  AUTHORITY: 'Tourism Authority',
  ADMIN: 'Administrator',
};

// Role-based redirects
export const ROLE_DASHBOARDS: Record<string, string> = {
  TOURIST: '/dashboard',
  BUSINESS: '/business/dashboard',
  AUTHORITY: '/admin/tourism',
  ADMIN: '/admin/tourism',
};

// Onboarding options
export const AGE_RANGES = ['18-24', '25-34', '35-44', '45-54', '55-64', '65+'];
export const TRAVEL_GROUPS = ['Solo', 'Couple', 'Family', 'Friends', 'Group Tour'];
export const BUDGET_PREFERENCES = ['Budget (₹2,000-5,000)', 'Mid-Range (₹5,000-15,000)', 'Premium (₹15,000-30,000)', 'Luxury (₹30,000+)'];
export const TRAVEL_STYLES = ['Relaxed', 'Adventure', 'Cultural', 'Spiritual', 'Foodie', 'Photography', 'Eco-Tourism'];
export const INTEREST_OPTIONS = ['Nature', 'Adventure', 'Food', 'Heritage', 'Photography', 'Wildlife', 'Trekking', 'Water Sports', 'Shopping', 'Wellness', 'Local Culture', 'Nightlife'];
export const FOOD_PREFERENCES = ['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Jain', 'No Preference'];
export const ADVENTURE_PREFERENCES = ['Low (Sightseeing only)', 'Medium (Light treks, boating)', 'High (Paragliding, rappelling)', 'Extreme (Rock climbing, cliff jumping)'];
export const ACCOMMODATION_PREFERENCES = ['Budget Hotel', 'Mid-Range Hotel', 'Homestay', 'Resort', 'Camping', 'No Preference'];

// Navigation items for different roles
export const TOURIST_NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { href: '/trip-planner', label: 'Plan Trip', icon: 'Route' },
  { href: '/businesses', label: 'Discover', icon: 'Store' },
  { href: '/map', label: 'Map', icon: 'Map' },
  { href: '/impact', label: 'Impact', icon: 'Heart' },
  { href: '/safety', label: 'Safety', icon: 'Shield' },
];

export const BUSINESS_NAV = [
  { href: '/business/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { href: '/businesses', label: 'Directory', icon: 'Store' },
  { href: '/map', label: 'Map', icon: 'Map' },
];

export const AUTHORITY_NAV = [
  { href: '/admin/tourism', label: 'Dashboard', icon: 'LayoutDashboard' },
  { href: '/map', label: 'Digital Twin', icon: 'Map' },
  { href: '/businesses', label: 'Businesses', icon: 'Store' },
  { href: '/impact', label: 'Impact', icon: 'Heart' },
];

// Emergency contacts
export const EMERGENCY_CONTACTS = [
  { name: 'Police', number: '100', icon: 'Shield' },
  { name: 'Ambulance', number: '108', icon: 'Siren' },
  { name: 'Fire', number: '101', icon: 'Flame' },
  { name: 'Tourist Helpline', number: '1363', icon: 'Phone' },
  { name: 'Women Helpline', number: '1091', icon: 'Phone' },
  { name: 'Disaster Management', number: '1070', icon: 'AlertTriangle' },
];

// Weather impact multipliers (for simulation)
export const WEATHER_IMPACT = {
  normal: { outdoor: 1.0, indoor: 1.0, label: '☀️ Clear' },
  rain: { outdoor: 0.5, indoor: 1.2, label: '🌧️ Rain' },
  heavy_rain: { outdoor: 0.1, indoor: 1.5, label: '⛈️ Heavy Rain' },
} as const;

export const CROWD_IMPACT = {
  LOW: { score_modifier: 1.2, label: '🟢 Low Crowd' },
  MEDIUM: { score_modifier: 1.0, label: '🟡 Moderate' },
  HIGH: { score_modifier: 0.6, label: '🔴 Crowded' },
} as const;

export const TRAFFIC_IMPACT = {
  low: { time_multiplier: 1.0, label: '🟢 Clear Roads' },
  medium: { time_multiplier: 1.5, label: '🟡 Moderate Traffic' },
  high: { time_multiplier: 2.5, label: '🔴 Heavy Traffic' },
} as const;
