// ============================================================
// TravelPulse AI — Core Type Definitions
// ============================================================

export type UserRole = 'TOURIST' | 'BUSINESS' | 'AUTHORITY' | 'ADMIN';

export interface UserProfile {
  id: string;
  role: UserRole;
  full_name: string | null;
  avatar_url: string | null;
  onboarding_complete: boolean;
  age_range: string | null;
  travel_group: string | null;
  budget_preference: string | null;
  preferred_destinations: string[];
  travel_style: string | null;
  interests: string[];
  food_preferences: string[];
  adventure_preference: string | null;
  accommodation_preference: string | null;
  created_at: string;
  updated_at: string;
}

export interface Destination {
  id: string;
  name: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  description: string;
  categories: string[];
  best_season: string;
  average_budget_per_day: number;
  image_url: string;
}

export interface Attraction {
  id: string;
  destination_id: string;
  name: string;
  type: AttractionType;
  description: string;
  latitude: number;
  longitude: number;
  image_url: string;
  opening_hours: string;
  entry_fee: number;
  avg_visit_duration_min: number;
  crowd_level: CrowdLevel;
  visitors_today: number;
  visitors_weekly: number;
  visitors_monthly: number;
  tourism_score: number;
  tags: string[];
  is_hidden_gem: boolean;
}

export type AttractionType =
  | 'viewpoint'
  | 'lake'
  | 'waterfall'
  | 'fort'
  | 'temple'
  | 'garden'
  | 'park'
  | 'plateau'
  | 'museum'
  | 'market'
  | 'monument'
  | 'beach'
  | 'valley';

export type CrowdLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Business {
  id: string;
  destination_id: string;
  owner_id?: string | null;
  name: string;
  category: BusinessCategory;
  description: string;
  latitude: number;
  longitude: number;
  image_url?: string;
  price_range?: 'budget' | 'mid-range' | 'premium';
  price_per_unit: number;
  rating: number;
  review_count: number;
  reviews?: number;
  contact_phone?: string;
  contact_email?: string;
  address: string;
  location?: string;
  amenities: string[];
  is_local?: boolean;
  is_verified?: boolean;
  eco_certified?: boolean;
  is_open?: boolean;
  price_level?: number;
}

export type BusinessCategory =
  | 'hotel'
  | 'homestay'
  | 'restaurant'
  | 'guide'
  | 'experience'
  | 'transport'
  | 'handicraft'
  | 'adventure';

export interface ItineraryItem {
  id: string;
  day: number;
  time: string;
  location: string;
  activity: string;
  type: 'attraction' | 'food' | 'transport' | 'accommodation' | 'experience' | 'shopping';
  estimated_cost: number;
  travel_time_min: number;
  distance_km: number;
  reason: string;
  latitude: number;
  longitude: number;
  suitability_score: number;
  is_indoor: boolean;
  crowd_level: CrowdLevel;
  status: 'pending' | 'completed' | 'skipped';
}

export interface Itinerary {
  id: string;
  user_id: string;
  title: string;
  origin: string;
  destination: string;
  duration_days: number;
  budget: number;
  travelers: number;
  travel_style: string;
  interests: string[];
  food_preference: string;
  accommodation_preference: string;
  status: 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  items: ItineraryItem[];
  optimization_log: OptimizationEntry[];
  total_estimated_cost: number;
  total_distance_km: number;
  local_businesses_count: number;
  sustainability_score: number;
  created_at: string;
  updated_at: string;
}

export interface OptimizationEntry {
  timestamp: string;
  reason: string;
  trigger: 'weather' | 'crowd' | 'traffic' | 'user_skip' | 'manual';
  before: string[];
  after: string[];
  explanation: string;
}

export interface SafetyFacility {
  id: string;
  destination_id: string;
  name: string;
  type: 'hospital' | 'police' | 'fire_station' | 'pharmacy' | 'emergency' | 'clinic';
  latitude: number;
  longitude: number;
  phone: string;
  address: string;
  is_24hr?: boolean;
  is_24_7?: boolean;
  hours?: string;
  verification_status?: string;
  emergency_services?: string[];
}

export interface TourismAnalytics {
  id: string;
  date: string;
  total_visitors: number;
  avg_spend: number;
  hotel_occupancy_pct: number;
  local_biz_revenue: number;
  sustainability_index: number;
  top_attractions: { name: string; visitors: number }[];
  crowd_distribution: { area: string; level: CrowdLevel; count: number }[];
}

export interface BusinessAnalytics {
  id: string;
  business_id: string;
  date: string;
  bookings: number;
  revenue: number;
  occupancy_pct: number;
  visitor_count: number;
  customer_segments: { segment: string; percentage: number }[];
}

// Simulation state
export type WeatherCondition = 'normal' | 'rain' | 'heavy_rain';
export type TrafficLevel = 'low' | 'medium' | 'high';

export interface SimulationState {
  weather: WeatherCondition;
  crowd: CrowdLevel;
  traffic: TrafficLevel;
}

// Trip planner form
export interface TripPlannerInput {
  origin: string;
  destination: string;
  duration_days: number;
  budget: number;
  travelers: number;
  travel_style: string;
  interests: string[];
  food_preference: string;
  accommodation_preference: string;
}

// Trip summary stats
export interface TripSummary {
  total_estimated_cost: number;
  remaining_budget: number;
  total_distance_km: number;
  local_businesses_count: number;
  experiences_count: number;
  time_efficiency_pct: number;
  sustainability_score: number;
  estimated_co2_kg: number;
}
