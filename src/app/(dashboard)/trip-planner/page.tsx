'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useSimulation } from '@/context/simulation-context';
import { useDestination } from '@/context/destination-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { getItineraryForDestination } from '@/lib/data/seed-itineraries';
import { INTEREST_OPTIONS, FOOD_PREFERENCES, ACCOMMODATION_PREFERENCES, TRAVEL_STYLES, WEATHER_IMPACT, CROWD_IMPACT, TRAFFIC_IMPACT } from '@/lib/constants';
import { ItineraryItem } from '@/lib/types';
import {
  Route, ArrowRight, Sparkles, MapPin, Clock, IndianRupee,
  Navigation, Store, Leaf, Brain, Calendar, Users, Star,
  ChevronDown, ChevronUp, AlertTriangle, Zap,
} from 'lucide-react';

export default function TripPlannerPage() {
  const router = useRouter();
  const { state: sim } = useSimulation();
  const { currentDestination, searchDestinations, setCurrentDestination } = useDestination();
  
  const [step, setStep] = useState<'form' | 'loading' | 'result'>('form');
  
  const [searchQuery, setSearchQuery] = useState(currentDestination?.name || '');
  const [showDropdown, setShowDropdown] = useState(false);
  
  const searchResults = searchDestinations(searchQuery).slice(0, 5);

  const [form, setForm] = useState({
    origin: 'Pune',
    destination: currentDestination?.name || '',
    duration_days: 3,
    budget: currentDestination?.average_budget_per_day ? currentDestination.average_budget_per_day * 3 : 8000,
    travelers: 2,
    travel_style: 'Relaxed',
    interests: ['Nature', 'Food'] as string[],
    food_preference: 'No Preference',
    accommodation_preference: 'Hotel',
  });
  
  useEffect(() => {
    if (currentDestination) {
      setSearchQuery(currentDestination.name);
      setForm(p => ({ 
        ...p, 
        destination: currentDestination.name,
        budget: currentDestination.average_budget_per_day * p.duration_days
      }));
    }
  }, [currentDestination]);

  const [expandedDay, setExpandedDay] = useState<number | null>(1);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [optimized, setOptimized] = useState(false);

  const toggleInterest = (interest: string) => {
    setForm(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleGenerate = async () => {
    if (!currentDestination && searchResults.length > 0) {
      setCurrentDestination(searchResults[0]);
    }
    
    setStep('loading');
    // Simulate AI generation delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In a real app, this is where we would call our AI backend and pass the destination_id.
    // For the demo, we fetch a tailored itinerary for the destination.
    const targetDest = currentDestination || searchResults[0];
    const baseItinerary = getItineraryForDestination(targetDest.id, targetDest.name);
    
    const generatedItinerary = { 
      ...baseItinerary, 
      title: `${form.duration_days} Days in ${form.destination || targetDest.name}`,
      destination: form.destination || targetDest.name,
      budget: form.budget,
      items: applySimulation(baseItinerary.items) 
    };
    
    setItinerary(generatedItinerary);
    setStep('result');
  };

  const applySimulation = (items: ItineraryItem[]): ItineraryItem[] => {
    return items.map(item => {
      const weatherMult = item.is_indoor ? WEATHER_IMPACT[sim.weather].indoor : WEATHER_IMPACT[sim.weather].outdoor;
      const crowdMult = CROWD_IMPACT[sim.crowd].score_modifier;
      const newScore = Math.round(item.suitability_score * weatherMult * crowdMult);
      const newTravelTime = Math.round(item.travel_time_min * TRAFFIC_IMPACT[sim.traffic].time_multiplier);
      return { ...item, suitability_score: Math.min(100, newScore), travel_time_min: newTravelTime };
    });
  };

  const handleOptimize = () => {
    if (!itinerary) return;
    const items = [...itinerary.items];
    const days = [...new Set(items.map(i => i.day))];
    const optimizedItems: ItineraryItem[] = [];

    for (const day of days) {
      const dayItems = items.filter(i => i.day === day);
      const fixed = dayItems.filter(i => ['transport', 'accommodation'].includes(i.type));
      const flexible = dayItems.filter(i => !['transport', 'accommodation'].includes(i.type));
      flexible.sort((a, b) => b.suitability_score - a.suitability_score);

      let currentTime = fixed.find(i => i.type === 'accommodation')?.time || '08:00';
      const reordered = [];

      for (const fix of fixed.filter(i => parseInt(i.time) < 12)) reordered.push(fix);
      for (const item of flexible) {
        const hour = parseInt(currentTime.split(':')[0]);
        const nextHour = hour + Math.ceil(item.travel_time_min / 60) + 1;
        currentTime = `${String(Math.min(nextHour, 23)).padStart(2, '0')}:00`;
        reordered.push({ ...item, time: currentTime });
      }
      for (const fix of fixed.filter(i => parseInt(i.time) >= 12)) reordered.push(fix);

      optimizedItems.push(...reordered);
    }

    setItinerary(prev => ({ ...prev, items: optimizedItems }));
    setOptimized(true);
  };

  const days = itinerary ? [...new Set(itinerary.items.map(i => i.day))] : [];
  const totalCost = itinerary ? itinerary.items.reduce((sum, i) => sum + i.estimated_cost, 0) : 0;
  const totalDistance = itinerary ? itinerary.items.reduce((sum, i) => sum + i.distance_km, 0) : 0;
  const localBizCount = itinerary ? new Set(itinerary.items.filter(i => ['food', 'experience', 'shopping'].includes(i.type)).map(i => i.location)).size : 0;

  if (step === 'form') {
    return (
      <div className="max-w-3xl mx-auto space-y-6 pb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-[#FAF7F2] flex items-center justify-center border border-[#1F3D2B]/10 shadow-editorial-sm">
              <Brain className="w-6 h-6 text-[#1F3D2B]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-serif text-[#1F3D2B]">AI Trip Planner</h1>
              <p className="text-[#6B6B6B] font-sans mt-1">Create your personalized intelligent itinerary anywhere in India</p>
            </div>
          </div>
        </motion.div>

        <Card className="bg-[#FFFFFF] shadow-editorial-md border-0 rounded-2xl overflow-visible">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-serif text-2xl text-[#1F3D2B]">
              <Route className="w-5 h-5 text-[#E27D4F]" />
              Trip Details
            </CardTitle>
            <CardDescription className="text-[#6B6B6B] font-sans">Tell us about your planned journey</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 overflow-visible">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Starting Location</Label>
                <Input value={form.origin} onChange={e => setForm(p => ({ ...p, origin: e.target.value }))} placeholder="e.g. Pune" />
              </div>
              <div className="space-y-2 relative">
                <Label>Destination in India</Label>
                <Input 
                  value={searchQuery} 
                  onChange={e => {
                    setSearchQuery(e.target.value);
                    setShowDropdown(true);
                  }} 
                  onFocus={() => setShowDropdown(true)}
                  placeholder="e.g. Goa, Jaipur, Manali" 
                />
                
                {showDropdown && searchQuery && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg z-50">
                    {searchResults.map(dest => (
                      <div 
                        key={dest.id}
                        className="px-3 py-2 hover:bg-muted cursor-pointer text-sm"
                        onClick={() => {
                          setCurrentDestination(dest);
                          setShowDropdown(false);
                        }}
                      >
                        {dest.name}, {dest.state}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Duration (days)</Label>
                <Input type="number" min={1} max={14} value={form.duration_days} onChange={e => {
                  const val = parseInt(e.target.value) || 1;
                  setForm(p => ({ 
                    ...p, 
                    duration_days: val,
                    budget: currentDestination ? currentDestination.average_budget_per_day * val : p.budget
                  }));
                }} />
              </div>
              <div className="space-y-2">
                <Label>Budget (₹)</Label>
                <Input type="number" min={1000} step={500} value={form.budget} onChange={e => setForm(p => ({ ...p, budget: parseInt(e.target.value) || 1000 }))} />
              </div>
              <div className="space-y-2">
                <Label>Travelers</Label>
                <Input type="number" min={1} max={20} value={form.travelers} onChange={e => setForm(p => ({ ...p, travelers: parseInt(e.target.value) || 1 }))} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#FFFFFF] shadow-editorial-md border-0 rounded-2xl mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-serif text-2xl text-[#1F3D2B]">
              <Sparkles className="w-5 h-5 text-[#E27D4F]" />
              Personalization
            </CardTitle>
            <CardDescription className="text-[#6B6B6B] font-sans">Help AI tailor the experience to you</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>What are your primary interests?</Label>
              <div className="flex flex-wrap gap-2">
                {INTEREST_OPTIONS.map(interest => (
                  <Badge
                    key={interest}
                    variant={form.interests.includes(interest) ? 'default' : 'outline'}
                    className={`cursor-pointer px-4 py-1.5 rounded-full font-sans transition-all ${
                      form.interests.includes(interest) 
                        ? 'bg-[#E27D4F] hover:bg-[#CB6639] text-white border-0 shadow-sm' 
                        : 'border-[#1F3D2B]/20 text-[#1F3D2B] hover:bg-[#FAF7F2]'
                    }`}
                    onClick={() => toggleInterest(interest)}
                  >
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border">
              <div className="space-y-2">
                <Label>Travel Style</Label>
                <select 
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={form.travel_style}
                  onChange={e => setForm(p => ({ ...p, travel_style: e.target.value }))}
                >
                  {TRAVEL_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Accommodation</Label>
                <select 
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={form.accommodation_preference}
                  onChange={e => setForm(p => ({ ...p, accommodation_preference: e.target.value }))}
                >
                  {ACCOMMODATION_PREFERENCES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Dietary Preference</Label>
                <select 
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={form.food_preference}
                  onChange={e => setForm(p => ({ ...p, food_preference: e.target.value }))}
                >
                  {FOOD_PREFERENCES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleGenerate} className="w-full h-14 text-lg bg-[#0E4D4A] hover:bg-[#1F3D2B] text-[#FAF7F2] border-0 rounded-full font-sans shadow-editorial-sm transition-transform hover:-translate-y-1 mt-8">
          <Sparkles className="w-5 h-5 mr-2" />
          Generate Smart Itinerary
        </Button>
      </div>
    );
  }

  if (step === 'loading') {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-6">
        <div className="relative w-24 h-24">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }} className="absolute inset-0 rounded-full border-t-2 border-l-2 border-emerald-500" />
          <motion.div animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 3, ease: "linear" }} className="absolute inset-2 rounded-full border-r-2 border-b-2 border-sky-500" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Brain className="w-8 h-8 text-emerald-400 animate-pulse" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold">AI is crafting your journey...</h2>
          <p className="text-sm text-muted-foreground animate-pulse">Analyzing {form.destination} attractions & weather data</p>
        </div>
      </div>
    );
  }

  // RESULT VIEW
  if (!itinerary) return null;
  
  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-start">
        <div>
          <Badge variant="outline" className="mb-3 bg-[#FAF7F2] text-[#0E4D4A] border-[#0E4D4A]/20 px-3 py-1 rounded-full font-sans">
            <Sparkles className="w-3 h-3 mr-1 text-[#E27D4F]" /> AI Generated for {form.destination}
          </Badge>
          <h1 className="text-4xl font-bold font-serif text-[#1F3D2B]">{itinerary.title}</h1>
          <p className="text-[#6B6B6B] mt-2 font-sans">
            {form.origin} → {form.destination} • {form.duration_days} Days • {form.travelers} Travelers
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-full font-sans border-[#1F3D2B]/20 text-[#1F3D2B] hover:bg-[#FAF7F2]" onClick={() => setStep('form')}>Edit Preferences</Button>
          <Button className="bg-[#E27D4F] hover:bg-[#CB6639] text-white border-0 rounded-full font-sans shadow-sm" onClick={() => router.push(`/trip/${itinerary.id}`)}>
            <Navigation className="w-4 h-4 mr-2" /> Start Trip
          </Button>
        </div>
      </motion.div>

      {/* Dynamic Alerts Banner */}
      {(sim.weather !== 'normal' || sim.crowd !== 'MEDIUM' || sim.traffic !== 'low') && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 flex gap-3 items-start">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-amber-500 flex items-center gap-2">
              Live Conditions Detected in {form.destination}
              {!optimized && (
                <Button size="sm" onClick={handleOptimize} className="h-7 text-xs ml-auto bg-amber-500 hover:bg-amber-600 text-white border-0">
                  <Zap className="w-3 h-3 mr-1" /> Optimize Journey
                </Button>
              )}
            </h4>
            <p className="text-sm text-muted-foreground mt-1">
              {sim.weather !== 'normal' && `Weather: ${WEATHER_IMPACT[sim.weather].label}. `}
              {sim.crowd !== 'MEDIUM' && `Crowds: ${CROWD_IMPACT[sim.crowd].label}. `}
              {sim.traffic !== 'low' && `Traffic: ${TRAFFIC_IMPACT[sim.traffic].label}. `}
              {!optimized ? "Suitability scores have changed. Optimize your itinerary to reorder activities for the best experience." : "Your itinerary has been optimized for current conditions."}
            </p>
          </div>
        </motion.div>
      )}

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Est. Total Cost', value: `₹${totalCost.toLocaleString()}`, icon: IndianRupee, color: 'text-[#E27D4F]' },
          { label: 'Travel Distance', value: `${totalDistance} km`, icon: Route, color: 'text-[#0E4D4A]' },
          { label: 'Local Biz Supported', value: localBizCount, icon: Store, color: 'text-[#E27D4F]' },
          { label: 'Eco Score', value: `${itinerary.sustainability_score}/100`, icon: Leaf, color: 'text-[#1F3D2B]' },
        ].map((stat, i) => (
          <Card key={stat.label} className="bg-[#FFFFFF] border-0 shadow-editorial-sm rounded-2xl">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border border-[#1F3D2B]/5 flex items-center justify-center mb-3">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold font-serif text-[#1F3D2B]">{stat.value}</p>
              <p className="text-sm text-[#6B6B6B] font-sans">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ITINERARY DAYS */}
      <div className="space-y-4">
        {days.map((day) => {
          const isExpanded = expandedDay === day;
          const dayItems = itinerary.items.filter(i => i.day === day);
          
          return (
            <Card key={day} className="bg-[#FFFFFF] border border-[#1F3D2B]/10 overflow-hidden shadow-editorial-sm rounded-2xl transition-colors hover:border-[#E27D4F]/30">
              <div 
                className="p-5 flex items-center justify-between cursor-pointer bg-[#FAF7F2]"
                onClick={() => setExpandedDay(isExpanded ? null : day)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#1F3D2B] flex items-center justify-center text-[#FAF7F2] font-serif text-lg font-bold shadow-sm">
                    D{day}
                  </div>
                  <div>
                    <h3 className="font-bold text-xl font-serif text-[#1F3D2B]">Day {day}</h3>
                    <p className="text-sm text-[#6B6B6B] font-sans">{dayItems.length} activities planned</p>
                  </div>
                </div>
                {isExpanded ? <ChevronUp className="w-5 h-5 text-[#1F3D2B]/50" /> : <ChevronDown className="w-5 h-5 text-[#1F3D2B]/50" />}
              </div>

              {isExpanded && (
                <div className="p-0">
                  <div className="divide-y divide-[#1F3D2B]/5">
                    {dayItems.map((item, index) => (
                      <motion.div 
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-5 sm:px-8 flex flex-col sm:flex-row gap-6 hover:bg-[#FAF7F2]/50 transition-colors"
                      >
                        <div className="w-24 shrink-0 flex flex-col items-start sm:items-end border-r border-[#1F3D2B]/10 pr-6">
                          <span className="font-mono font-bold text-lg text-[#0E4D4A]">{item.time}</span>
                          <span className="text-xs text-[#6B6B6B] flex items-center gap-1 mt-1 font-sans">
                            <Clock className="w-3 h-3" /> {item.travel_time_min}m
                          </span>
                        </div>

                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-lg font-serif text-[#1F3D2B]">{item.location}</h4>
                            <Badge variant="outline" className={`text-xs px-2 py-0.5 rounded-full font-sans ${
                              item.suitability_score > 80 ? 'text-[#0E4D4A] border-[#0E4D4A]/20 bg-[#0E4D4A]/5' :
                              item.suitability_score > 50 ? 'text-[#E27D4F] border-[#E27D4F]/30 bg-[#E27D4F]/10' :
                              'text-[#CB6639] border-[#CB6639]/30 bg-[#CB6639]/10'
                            }`}>
                              {item.suitability_score}% Match
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-[#1C1C1C]/80 mb-3 font-sans leading-relaxed">{item.activity}</p>
                          <p className="text-xs text-[#6B6B6B] italic border-l-2 border-[#E27D4F] pl-3 py-1 font-sans bg-[#FAF7F2]/50 rounded-r-md">
                            "{item.reason}"
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
