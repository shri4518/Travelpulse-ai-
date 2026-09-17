'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSimulation } from '@/context/simulation-context';
import { useDestination } from '@/context/destination-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { seedAttractions } from '@/lib/data/seed-attractions';
import { seedBusinesses } from '@/lib/data/seed-businesses';
import { seedSafetyFacilities } from '@/lib/data/seed-safety';
import { seedDestinations } from '@/lib/data/seed-destinations';
import { Map as MapIcon, Search, Layers, Filter, Cloud, Shield, Store, MapPin, X, Navigation } from 'lucide-react';

type LayerType = 'attractions' | 'businesses' | 'safety' | 'heatmap';

export default function MapPage() {
  const { state: sim } = useSimulation();
  const { currentDestination, setCurrentDestination } = useDestination();
  
  // If no destination is selected, we prompt the user
  const activeDest = currentDestination;

  const [activeLayers, setActiveLayers] = useState<LayerType[]>(['attractions']);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPoint, setSelectedPoint] = useState<any>(null);

  const toggleLayer = (layer: LayerType) => {
    setActiveLayers(prev => 
      prev.includes(layer) ? prev.filter(l => l !== layer) : [...prev, layer]
    );
  };

  const getPoints = () => {
    let points: any[] = [];
    if (activeLayers.includes('attractions')) points = [...points, ...seedAttractions];
    if (activeLayers.includes('businesses')) points = [...points, ...seedBusinesses];
    if (activeLayers.includes('safety')) points = [...points, ...seedSafetyFacilities];
    
    // Filter by destination if one is active
    if (activeDest) {
      points = points.filter(p => p.destination_id === activeDest.id);
    }

    if (searchQuery) {
      points = points.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return points;
  };

  const points = getPoints();

  // Normalize coordinates for simple 2D display relative to center
  const centerLat = activeDest ? activeDest.latitude : 20.5937; // Default to India center
  const centerLng = activeDest ? activeDest.longitude : 78.9629;
  const latSpread = activeDest ? 0.1 : 15;
  const lngSpread = activeDest ? 0.1 : 15;

  const getPointPosition = (point: any) => {
    // Basic mapping to percentage for demo visual purposes
    const latDiff = point.latitude - centerLat;
    const lngDiff = point.longitude - centerLng;
    const x = 50 + (lngDiff / lngSpread) * 50;
    const y = 50 - (latDiff / latSpread) * 50;
    return { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) };
  };

  const getPointColor = (point: any) => {
    if ('category' in point && !('is_hidden_gem' in point)) {
      if (point.category === 'hotel') return 'bg-secondary';
      if (point.category === 'restaurant') return 'bg-accent';
      return 'bg-primary'; // experiences/guides
    }
    if ('type' in point && (point.type.includes('hospital') || point.type.includes('police'))) {
      return 'bg-destructive';
    }
    if (point.crowd_level === 'HIGH') return 'bg-accent';
    if (point.crowd_level === 'LOW') return 'bg-secondary';
    return 'bg-primary';
  };

  const getPointIcon = (point: any) => {
    if ('category' in point && !('is_hidden_gem' in point)) return <Store className="w-3 h-3 text-white" />;
    if ('type' in point && (point.type.includes('hospital') || point.type.includes('police'))) return <Shield className="w-3 h-3 text-white" />;
    return <MapPin className="w-3 h-3 text-white" />;
  };

  return (
    <div className="h-[calc(100vh-6rem)] lg:h-[calc(100vh-4rem)] flex flex-col space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2 font-serif text-[#1F3D2B]">
            <MapIcon className="w-6 h-6 text-[#E27D4F]" />
            Digital Twin
          </h1>
          <p className="text-[#6B6B6B] font-sans mt-1">
            {activeDest ? `Real-time mapping of ${activeDest.name}` : 'Select a destination to view map'}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative">
            <select 
              className="flex h-10 w-full sm:w-48 rounded-full border border-[#1F3D2B]/20 bg-[#FAF7F2] px-4 py-1 text-sm shadow-sm font-sans focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#1F3D2B]"
              value={activeDest ? activeDest.id : ''}
              onChange={(e) => {
                const dest = seedDestinations.find(d => d.id === e.target.value);
                if (dest) setCurrentDestination(dest);
              }}
            >
              <option value="">Select Destination</option>
              {seedDestinations.map(d => (
                <option key={d.id} value={d.id}>{d.name}, {d.state}</option>
              ))}
            </select>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6B6B]" />
            <Input 
              placeholder="Search places..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 h-10 rounded-full border-[#1F3D2B]/20 bg-[#FAF7F2] font-sans"
            />
          </div>
          <div className="flex gap-2">
            {[
              { id: 'attractions', icon: MapPin, label: 'Places' },
              { id: 'businesses', icon: Store, label: 'Businesses' },
              { id: 'safety', icon: Shield, label: 'Safety' },
            ].map(layer => (
              <Button
                key={layer.id}
                variant={activeLayers.includes(layer.id as LayerType) ? 'default' : 'outline'}
                size="sm"
                className={`h-10 rounded-full font-sans transition-all px-4 ${
                  activeLayers.includes(layer.id as LayerType) 
                    ? 'bg-[#1F3D2B] text-white border-0 shadow-sm hover:bg-[#0E4D4A]' 
                    : 'border-[#1F3D2B]/20 text-[#1F3D2B] hover:bg-[#FAF7F2]'
                }`}
                onClick={() => toggleLayer(layer.id as LayerType)}
              >
                <layer.icon className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">{layer.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 relative rounded-xl overflow-hidden glass border-border">
        <div className="absolute inset-0 bg-[#0A101C]">
          <svg width="100%" height="100%" className="opacity-10 pointer-events-none">
            <defs>
              <pattern id="grid-map" width="100" height="100" patternUnits="userSpaceOnUse">
                <path d="M 100 0 L 0 0 0 100" fill="none" stroke="currentColor" strokeWidth="0.5" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" />
                <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="0.5" />
                <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-map)" />
            <path d="M0,200 Q200,100 400,250 T800,200" fill="none" stroke="#2D6A4F" strokeWidth="2" className="opacity-30" />
            <path d="M0,400 Q300,500 500,300 T1000,400" fill="none" stroke="#2D6A4F" strokeWidth="2" className="opacity-30" />
          </svg>
        </div>

        {activeLayers.includes('heatmap') && (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-500/20 via-transparent to-transparent blur-3xl opacity-50" />
        )}

        <div className="absolute inset-0">
          {points.map(point => {
            const pos = getPointPosition(point);
            const color = getPointColor(point);
            const isSelected = selectedPoint?.id === point.id;
            
            // if pos is completely off screen, don't render to keep UI clean
            if (pos.x < -10 || pos.x > 110 || pos.y < -10 || pos.y > 110) return null;

            return (
              <motion.button
                key={point.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: isSelected ? 1.2 : 1, opacity: 1 }}
                whileHover={{ scale: 1.2, zIndex: 10 }}
                onClick={() => setSelectedPoint(point)}
                className={`absolute w-8 h-8 rounded-full ${color} shadow-lg flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-colors ${isSelected ? 'ring-2 ring-white z-10' : 'z-0'}`}
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              >
                {getPointIcon(point)}
                
                {point.crowd_level === 'HIGH' && (
                  <span className="absolute inset-0 rounded-full animate-ping bg-red-400 opacity-75" />
                )}
              </motion.button>
            );
          })}
          {points.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-background/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground text-center">
                {!activeDest 
                  ? 'Please select a destination from the dropdown above.' 
                  : 'No POIs seeded yet for this destination.'}
              </div>
            </div>
          )}
        </div>

        <AnimatePresence>
          {selectedPoint && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="absolute left-4 top-4 bottom-4 w-80 max-h-full bg-[#FFFFFF] rounded-2xl border border-[#1F3D2B]/10 shadow-editorial-lg flex flex-col"
            >
              <div className="p-5 border-b border-[#1F3D2B]/5 flex items-start justify-between shrink-0 bg-[#FAF7F2] rounded-t-2xl">
                <div>
                  <h3 className="font-bold text-xl font-serif text-[#1F3D2B]">{selectedPoint.name}</h3>
                  <p className="text-xs text-[#6B6B6B] font-sans mt-0.5 capitalize">
                    {selectedPoint.category || selectedPoint.type || 'Attraction'}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedPoint(null)} className="h-8 w-8 p-0">
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="p-4 overflow-y-auto space-y-4">
                {selectedPoint.description && (
                  <p className="text-sm text-muted-foreground">{selectedPoint.description}</p>
                )}
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-muted/30 p-2">
                    <p className="text-[10px] text-muted-foreground mb-1">Status</p>
                    <Badge variant="outline" className={`text-[10px] ${selectedPoint.is_open !== false ? 'text-green-400 border-green-500/30' : 'text-red-400 border-red-500/30'}`}>
                      {selectedPoint.is_open !== false ? 'Open Now' : 'Closed'}
                    </Badge>
                  </div>
                  
                  {selectedPoint.rating && (
                    <div className="rounded-lg bg-muted/30 p-2">
                      <p className="text-[10px] text-muted-foreground mb-1">Rating</p>
                      <p className="text-sm font-medium flex items-center gap-1">
                        ⭐ {selectedPoint.rating} <span className="text-xs text-muted-foreground">({selectedPoint.reviews || selectedPoint.review_count})</span>
                      </p>
                    </div>
                  )}
                  
                  {selectedPoint.crowd_level && (
                    <div className="rounded-lg bg-muted/30 p-2">
                      <p className="text-[10px] text-muted-foreground mb-1">Crowd</p>
                      <Badge variant="outline" className={`text-[10px] ${
                        selectedPoint.crowd_level === 'HIGH' ? 'text-red-400 border-red-500/30' :
                        selectedPoint.crowd_level === 'LOW' ? 'text-green-400 border-green-500/30' :
                        'text-amber-400 border-amber-500/30'
                      }`}>
                        {selectedPoint.crowd_level}
                      </Badge>
                    </div>
                  )}
                  
                  {selectedPoint.price_per_unit && (
                    <div className="rounded-lg bg-muted/30 p-2">
                      <p className="text-[10px] text-muted-foreground mb-1">Price</p>
                      <p className="text-sm font-medium">₹{selectedPoint.price_per_unit}</p>
                    </div>
                  )}
                </div>

                <Button className="w-full bg-[#E27D4F] hover:bg-[#CB6639] text-white rounded-full font-sans shadow-sm border-0 mt-4 h-12">
                  <Navigation className="w-4 h-4 mr-2" />
                  Navigate Here
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute bottom-4 right-4 bg-[#FFFFFF] rounded-2xl p-4 text-xs font-sans flex flex-col gap-3 shadow-editorial-md border border-[#1F3D2B]/10 pointer-events-none">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#A9C9D6]" /> <span>Hotels</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#E27D4F]" /> <span>Restaurants</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#0E4D4A]" /> <span>Low Crowd Attractions</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#CB6639]" /> <span>High Crowd / Safety</span>
          </div>
        </div>

        {sim.weather !== 'normal' && (
          <div className="absolute top-4 right-4 bg-[#FFFFFF] rounded-2xl p-4 shadow-editorial-md border border-[#1F3D2B]/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#A9C9D6]/20 flex items-center justify-center">
              <Cloud className="w-5 h-5 text-[#0E4D4A]" />
            </div>
            <div>
              <p className="text-sm font-bold font-serif text-[#1F3D2B]">Weather Alert</p>
              <p className="text-[10px] text-[#6B6B6B] font-sans">{sim.weather === 'rain' ? 'Rain in area' : 'Heavy storms'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
