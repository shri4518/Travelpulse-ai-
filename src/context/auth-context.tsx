'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile, UserRole } from '@/lib/types';

interface AuthContextValue {
  user: UserProfile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  login: async () => {},
  signup: async () => {},
  logout: () => {},
  updateProfile: () => {},
});

// Demo users for fallback when Supabase is not configured
const DEMO_USERS: Record<string, UserProfile> = {
  'tourist@demo.com': {
    id: 'demo-tourist-001',
    role: 'TOURIST',
    full_name: 'Arjun Sharma',
    avatar_url: null,
    onboarding_complete: true,
    age_range: '25-34',
    travel_group: 'Friends',
    budget_preference: 'Mid-Range (₹5,000-15,000)',
    preferred_destinations: ['Mahabaleshwar', 'Lonavala'],
    travel_style: 'Adventure',
    interests: ['Nature', 'Adventure', 'Food', 'Heritage'],
    food_preferences: ['No Preference'],
    adventure_preference: 'Medium (Light treks, boating)',
    accommodation_preference: 'Homestay',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  'business@demo.com': {
    id: 'demo-business-001',
    role: 'BUSINESS',
    full_name: 'Priya Deshmukh',
    avatar_url: null,
    onboarding_complete: true,
    age_range: '35-44',
    travel_group: null,
    budget_preference: null,
    preferred_destinations: [],
    travel_style: null,
    interests: [],
    food_preferences: [],
    adventure_preference: null,
    accommodation_preference: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  'authority@demo.com': {
    id: 'demo-authority-001',
    role: 'AUTHORITY',
    full_name: 'Rajesh Patil',
    avatar_url: null,
    onboarding_complete: true,
    age_range: '45-54',
    travel_group: null,
    budget_preference: null,
    preferred_destinations: [],
    travel_style: null,
    interests: [],
    food_preferences: [],
    adventure_preference: null,
    accommodation_preference: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for persisted session on mount
  useEffect(() => {
    const stored = localStorage.getItem('travelpulse_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('travelpulse_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, _password: string) => {
    setIsLoading(true);
    try {
      // Try Supabase first
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: _password }),
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        localStorage.setItem('travelpulse_user', JSON.stringify(data.user));
        return;
      }

      // Fallback to demo users
      const demoUser = DEMO_USERS[email.toLowerCase()];
      if (demoUser) {
        setUser(demoUser);
        localStorage.setItem('travelpulse_user', JSON.stringify(demoUser));
        return;
      }

      throw new Error('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(async (email: string, password: string, role: UserRole) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        localStorage.setItem('travelpulse_user', JSON.stringify(data.user));
        return;
      }

      // Fallback: create a local demo user
      const newUser: UserProfile = {
        id: `user-${Date.now()}`,
        role,
        full_name: email.split('@')[0],
        avatar_url: null,
        onboarding_complete: false,
        age_range: null,
        travel_group: null,
        budget_preference: null,
        preferred_destinations: [],
        travel_style: null,
        interests: [],
        food_preferences: [],
        adventure_preference: null,
        accommodation_preference: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setUser(newUser);
      localStorage.setItem('travelpulse_user', JSON.stringify(newUser));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('travelpulse_user');
    // Also call server logout
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
  }, []);

  const updateProfile = useCallback((data: Partial<UserProfile>) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...data, updated_at: new Date().toISOString() };
      localStorage.setItem('travelpulse_user', JSON.stringify(updated));
      // Also try to update server
      fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).catch(() => {});
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
