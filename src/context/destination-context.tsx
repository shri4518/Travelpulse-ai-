'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Destination } from '@/lib/types';
import { seedDestinations } from '@/lib/data/seed-destinations';

interface DestinationContextType {
  currentDestination: Destination | null;
  setCurrentDestination: (dest: Destination | null) => void;
  searchDestinations: (query: string) => Destination[];
  getDestinationsByCategory: (category: string) => Destination[];
}

const DestinationContext = createContext<DestinationContextType | undefined>(undefined);

export function DestinationProvider({ children }: { children: React.ReactNode }) {
  // Default to null initially so we don't force a destination
  const [currentDestination, setCurrentDestination] = useState<Destination | null>(null);

  const searchDestinations = (query: string) => {
    if (!query) return [];
    const q = query.toLowerCase();
    return seedDestinations.filter(d => 
      d.name.toLowerCase().includes(q) || 
      d.state.toLowerCase().includes(q) || 
      d.categories.some(c => c.toLowerCase().includes(q))
    );
  };

  const getDestinationsByCategory = (category: string) => {
    return seedDestinations.filter(d => 
      d.categories.some(c => c.toLowerCase() === category.toLowerCase())
    );
  };

  return (
    <DestinationContext.Provider value={{
      currentDestination,
      setCurrentDestination,
      searchDestinations,
      getDestinationsByCategory
    }}>
      {children}
    </DestinationContext.Provider>
  );
}

export function useDestination() {
  const context = useContext(DestinationContext);
  if (context === undefined) {
    throw new Error('useDestination must be used within a DestinationProvider');
  }
  return context;
}
