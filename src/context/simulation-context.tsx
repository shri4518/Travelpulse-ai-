'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { SimulationState, WeatherCondition, CrowdLevel, TrafficLevel } from '@/lib/types';

interface SimulationContextValue {
  state: SimulationState;
  setWeather: (weather: WeatherCondition) => void;
  setCrowd: (crowd: CrowdLevel) => void;
  setTraffic: (traffic: TrafficLevel) => void;
  isActive: boolean;
  toggleActive: () => void;
}

const defaultState: SimulationState = {
  weather: 'normal',
  crowd: 'MEDIUM',
  traffic: 'low',
};

const SimulationContext = createContext<SimulationContextValue>({
  state: defaultState,
  setWeather: () => {},
  setCrowd: () => {},
  setTraffic: () => {},
  isActive: false,
  toggleActive: () => {},
});

export function SimulationProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SimulationState>(defaultState);
  const [isActive, setIsActive] = useState(false);

  const setWeather = useCallback((weather: WeatherCondition) => {
    setState(prev => ({ ...prev, weather }));
  }, []);

  const setCrowd = useCallback((crowd: CrowdLevel) => {
    setState(prev => ({ ...prev, crowd }));
  }, []);

  const setTraffic = useCallback((traffic: TrafficLevel) => {
    setState(prev => ({ ...prev, traffic }));
  }, []);

  const toggleActive = useCallback(() => {
    setIsActive(prev => !prev);
  }, []);

  return (
    <SimulationContext.Provider value={{ state, setWeather, setCrowd, setTraffic, isActive, toggleActive }}>
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation() {
  const context = useContext(SimulationContext);
  if (!context) throw new Error('useSimulation must be used within SimulationProvider');
  return context;
}
