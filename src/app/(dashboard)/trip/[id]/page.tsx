'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSimulation } from '@/context/simulation-context';
import { seedItinerary } from '@/lib/data/seed-itineraries';
import { WEATHER_IMPACT, CROWD_IMPACT, TRAFFIC_IMPACT } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ItineraryItem } from '@/lib/types';
import {
  MapPin, Clock, IndianRupee, Navigation, Cloud, AlertTriangle,
  Check, SkipForward, RefreshCw, ChevronRight, Zap, Star,
} from 'lucide-react';

export default function LiveTripPage() {
  const { state: sim } = useSimulation();
  const [items, setItems] = useState<ItineraryItem[]>(seedItinerary.items);
  const trip = seedItinerary;

  const completedCount = items.filter(i => i.status === 'completed').length;
  const totalItems = items.length;
  const progressPct = Math.round((completedCount / totalItems) * 100);
  const spent = items.filter(i => i.status === 'completed').reduce((s, i) => s + i.estimated_cost, 0);
  const remaining = trip.budget - spent;

  // Current activity = first pending item
  const currentItem = items.find(i => i.status === 'pending');
  const currentIndex = currentItem ? items.indexOf(currentItem) : -1;
  const nextItem = currentIndex >= 0 ? items[currentIndex + 1] : null;

  // Today's items (day of current item)
  const currentDay = currentItem?.day || 1;
  const todayItems = items.filter(i => i.day === currentDay);

  const handleComplete = (id: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, status: 'completed' } : i));
  };

  const handleSkip = (id: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, status: 'skipped' } : i));
  };

  const handleReplan = (id: string) => {
    // Replace with a hidden gem suggestion
    setItems(prev => prev.map(i => {
      if (i.id !== id) return i;
      return {
        ...i,
        location: "Elephant's Head Point",
        activity: 'Hidden Gem Viewpoint Visit (AI Suggested)',
        reason: 'Low crowd alternative with scenic views. Supports under-visited destination.',
        suitability_score: 92,
        crowd_level: 'LOW',
        estimated_cost: 20,
      };
    }));
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-[#0E4D4A] border-[#0E4D4A]/30 bg-[#0E4D4A]/5';
    if (score >= 60) return 'text-[#E27D4F] border-[#E27D4F]/30 bg-[#E27D4F]/5';
    return 'text-[#CB6639] border-[#CB6639]/30 bg-[#CB6639]/5';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold font-serif text-[#1F3D2B]">{trip.title}</h1>
        <p className="text-[#6B6B6B] font-sans mt-2">{trip.origin} → {trip.destination} · Day {currentDay} of {trip.duration_days}</p>
      </motion.div>

      {/* Weather alert */}
      {sim.weather !== 'normal' && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-400">⚠ JOURNEY UPDATE</p>
            <p className="text-xs text-muted-foreground">
              {sim.weather === 'rain' ? 'Light rain detected. Outdoor scores adjusted.' : 'Heavy rainfall expected. Consider indoor alternatives.'}
            </p>
          </div>
        </div>
      )}

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#FFFFFF] border border-[#1F3D2B]/10 rounded-2xl p-4 text-center shadow-editorial-sm">
          <p className="text-2xl font-bold font-serif text-[#1F3D2B]">{progressPct}%</p>
          <p className="text-xs text-[#6B6B6B] font-sans mt-1">Trip Complete</p>
          <Progress value={progressPct} className="h-1.5 mt-2 bg-[#FAF7F2] [&>div]:bg-[#0E4D4A]" />
        </div>
        <div className="bg-[#FFFFFF] border border-[#1F3D2B]/10 rounded-2xl p-4 text-center shadow-editorial-sm">
          <p className="text-2xl font-bold font-serif text-[#1F3D2B]">₹{spent.toLocaleString()}</p>
          <p className="text-xs text-[#6B6B6B] font-sans mt-1">Spent</p>
        </div>
        <div className="bg-[#FFFFFF] border border-[#1F3D2B]/10 rounded-2xl p-4 text-center shadow-editorial-sm">
          <p className="text-2xl font-bold font-serif text-[#E27D4F]">₹{remaining.toLocaleString()}</p>
          <p className="text-xs text-[#6B6B6B] font-sans mt-1">Remaining</p>
        </div>
        <div className="bg-[#FFFFFF] border border-[#1F3D2B]/10 rounded-2xl p-4 text-center shadow-editorial-sm">
          <p className="text-2xl font-bold font-serif text-[#1F3D2B] truncate">{WEATHER_IMPACT[sim.weather].label}</p>
          <p className="text-xs text-[#6B6B6B] font-sans mt-1">Weather</p>
        </div>
      </div>

      {/* Current Activity Highlight */}
      {currentItem && (
        <Card className="bg-[#FFFFFF] border-l-4 border-l-[#E27D4F] border-y-0 border-r-0 rounded-2xl shadow-editorial-md overflow-hidden">
          <CardHeader className="pb-3 bg-[#FAF7F2]/50">
            <div className="flex items-center gap-3">
              <Badge className="bg-[#E27D4F] hover:bg-[#CB6639] text-white rounded-full px-3 py-1 font-sans text-xs shadow-sm border-0">Now</Badge>
              <CardTitle className="text-xl font-serif text-[#1F3D2B]">{currentItem.activity}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-4 p-6">
            <p className="text-sm text-[#1F3D2B] flex items-center gap-2 font-sans font-medium">
              <MapPin className="w-4 h-4 text-[#E27D4F]" /> {currentItem.location}
            </p>
            <p className="text-sm text-[#6B6B6B] italic font-sans border-l-2 border-[#E27D4F]/30 pl-3">
              "{currentItem.reason}"
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-[#6B6B6B] font-sans pt-2">
              <span className="flex items-center gap-1.5"><IndianRupee className="w-4 h-4 text-[#1F3D2B]" /> ₹{currentItem.estimated_cost}</span>
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-[#1F3D2B]" /> {currentItem.travel_time_min} min</span>
              <Badge variant="outline" className={`text-xs px-2 py-0.5 rounded-full font-sans ${getScoreColor(currentItem.suitability_score)}`}>
                Score: {currentItem.suitability_score}%
              </Badge>
            </div>
            <div className="flex flex-wrap gap-3 pt-3 border-t border-[#1F3D2B]/5">
              <Button size="sm" className="bg-[#0E4D4A] hover:bg-[#1F3D2B] text-white rounded-full shadow-sm font-sans px-5 h-9" onClick={() => handleComplete(currentItem.id)}>
                <Check className="w-4 h-4 mr-1.5" /> Complete
              </Button>
              <Button size="sm" variant="outline" className="rounded-full border-[#1F3D2B]/20 text-[#1F3D2B] hover:bg-[#FAF7F2] font-sans px-5 h-9" onClick={() => handleSkip(currentItem.id)}>
                <SkipForward className="w-4 h-4 mr-1.5" /> Skip
              </Button>
              <Button size="sm" variant="outline" className="rounded-full border-[#E27D4F]/30 text-[#E27D4F] hover:bg-[#E27D4F]/5 font-sans px-5 h-9" onClick={() => handleReplan(currentItem.id)}>
                <RefreshCw className="w-4 h-4 mr-1.5" /> Replan
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next up */}
      {nextItem && (
        <div className="flex items-center gap-4 bg-[#FFFFFF] shadow-editorial-sm border border-[#1F3D2B]/5 rounded-2xl p-4">
          <div className="w-8 h-8 rounded-full bg-[#FAF7F2] flex items-center justify-center border border-[#1F3D2B]/10 shrink-0">
            <ChevronRight className="w-4 h-4 text-[#1F3D2B]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold font-serif text-[#1F3D2B] truncate">Next: {nextItem.activity}</p>
            <p className="text-xs text-[#6B6B6B] font-sans mt-0.5 truncate">{nextItem.time} · {nextItem.location}</p>
          </div>
          <Badge variant="outline" className={`text-xs px-2 py-0.5 rounded-full font-sans shrink-0 ${getScoreColor(nextItem.suitability_score)}`}>
            {nextItem.suitability_score}%
          </Badge>
        </div>
      )}

      {/* Today's Timeline */}
      <Card className="bg-[#FFFFFF] shadow-editorial-md border-0 rounded-2xl overflow-hidden">
        <CardHeader className="bg-[#FAF7F2] border-b border-[#1F3D2B]/5 p-5">
          <CardTitle className="text-xl font-serif text-[#1F3D2B]">Day {currentDay} Timeline</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-[#1F3D2B]/5">
            {todayItems.map((item) => (
              <div key={item.id} className={`flex gap-4 p-5 transition-all ${
                item.status === 'completed' ? 'bg-[#0E4D4A]/5 opacity-60' :
                item.status === 'skipped' ? 'bg-[#CB6639]/5 opacity-50 line-through' :
                item === currentItem ? 'bg-[#FAF7F2] border-l-4 border-l-[#E27D4F]' :
                'hover:bg-[#FAF7F2]/50'
              }`}>
                <div className="w-14 text-right shrink-0">
                  <span className="text-sm font-mono font-bold text-[#0E4D4A]">{item.time}</span>
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className={`text-base font-serif font-bold ${item === currentItem ? 'text-[#1F3D2B]' : 'text-[#1F3D2B]/80'}`}>
                    {item.activity}
                  </p>
                  <p className="text-xs text-[#6B6B6B] font-sans mt-1">{item.location}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-medium text-[#1F3D2B] font-sans">₹{item.estimated_cost}</span>
                  {item.status === 'completed' && <Check className="w-5 h-5 text-[#0E4D4A]" />}
                  {item.status === 'skipped' && <SkipForward className="w-5 h-5 text-[#CB6639]" />}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
