'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Heart, Leaf, Store, IndianRupee, MapPin, Users, Target, ArrowUpRight } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useDestination } from '@/context/destination-context';
import { seedDestinations } from '@/lib/data/seed-destinations';

export default function ImpactPage() {
  const { user } = useAuth();
  const { currentDestination } = useDestination();
  const activeDest = currentDestination || seedDestinations[0];

  const [tourismData, setTourismData] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/analytics/tourism');
        if (res.ok) {
          const json = await res.json();
          setTourismData(json.data);
        }
      } catch (err) {
        console.error('Failed to load tourism data:', err);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-[#FAF7F2] flex items-center justify-center border border-[#0E4D4A]/20 shadow-editorial-sm">
            <Leaf className="w-6 h-6 text-[#0E4D4A]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-serif text-[#1F3D2B]">Your Impact</h1>
            <p className="text-[#6B6B6B] font-sans mt-1">See how your travel choices strengthen {activeDest.name}</p>
          </div>
        </div>
      </motion.div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-[#FFFFFF] shadow-editorial-sm border-0 rounded-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#E27D4F]/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border border-[#E27D4F]/20 flex items-center justify-center">
                  <Store className="w-5 h-5 text-[#E27D4F]" />
                </div>
                <h3 className="font-bold text-[#1F3D2B] font-sans">Local Businesses</h3>
              </div>
              <p className="text-4xl font-bold font-serif text-[#1F3D2B] mb-2">12</p>
              <p className="text-sm text-[#6B6B6B] font-sans">Unique local partners supported</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-[#FFFFFF] shadow-editorial-sm border-0 rounded-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#0E4D4A]/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border border-[#0E4D4A]/20 flex items-center justify-center">
                  <IndianRupee className="w-5 h-5 text-[#0E4D4A]" />
                </div>
                <h3 className="font-bold text-[#1F3D2B] font-sans">Economic Injection</h3>
              </div>
              <p className="text-4xl font-bold font-serif text-[#0E4D4A] mb-2">₹24,500</p>
              <p className="text-sm text-[#6B6B6B] font-sans">Direct spending in local economy</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-[#FFFFFF] shadow-editorial-sm border-0 rounded-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#1F3D2B]/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border border-[#1F3D2B]/20 flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-[#1F3D2B]" />
                </div>
                <h3 className="font-bold text-[#1F3D2B] font-sans">Eco Score</h3>
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <p className="text-4xl font-bold font-serif text-[#1F3D2B]">
                  {tourismData ? tourismData.avgSustainability : '80.4'}
                </p>
                <p className="text-sm font-bold text-[#6B6B6B] font-sans pb-1">/ 100</p>
              </div>
              <p className="text-sm text-[#6B6B6B] font-sans">Top 15% of sustainable travelers</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
          <Card className="bg-[#FFFFFF] border-0 shadow-editorial-md rounded-2xl h-full">
            <CardHeader className="border-b border-[#1F3D2B]/5 bg-[#FAF7F2]/50 pb-5">
              <CardTitle className="text-xl font-serif text-[#1F3D2B]">Sustainable Choices</CardTitle>
              <CardDescription className="text-[#6B6B6B] font-sans mt-1">Breakdown of your eco-friendly actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-7 pt-6">
              <div className="space-y-3">
                <div className="flex justify-between text-sm font-sans font-medium text-[#1F3D2B]">
                  <span>Carbon Offset (Shared Transport)</span>
                  <span className="text-[#0E4D4A]">12 kg CO₂</span>
                </div>
                <Progress value={80} className="h-2.5 bg-[#FAF7F2] [&>div]:bg-[#0E4D4A]" />
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm font-sans font-medium text-[#1F3D2B]">
                  <span>Eco-Certified Accommodations</span>
                  <span className="text-[#0E4D4A]">3 nights</span>
                </div>
                <Progress value={60} className="h-2.5 bg-[#FAF7F2] [&>div]:bg-[#0E4D4A]" />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm font-sans font-medium text-[#1F3D2B]">
                  <span>Low-Crowd Attractions Visited</span>
                  <span className="text-[#0E4D4A]">4 places</span>
                </div>
                <Progress value={40} className="h-2.5 bg-[#FAF7F2] [&>div]:bg-[#0E4D4A]" />
                <p className="text-xs text-[#6B6B6B] font-sans italic border-l-2 border-[#1F3D2B]/10 pl-2">Helps reduce overtourism in popular spots.</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
          <Card className="bg-[#FFFFFF] border-0 shadow-editorial-md rounded-2xl h-full">
            <CardHeader className="border-b border-[#1F3D2B]/5 bg-[#FAF7F2]/50 pb-5">
              <CardTitle className="text-xl font-serif text-[#1F3D2B]">Community Badges</CardTitle>
              <CardDescription className="text-[#6B6B6B] font-sans mt-1">Achievements for responsible tourism</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 pt-6">
              {[
                { icon: Store, title: 'Local Champion', desc: 'Supported 10+ local vendors', color: 'text-[#E27D4F]', bg: 'bg-[#E27D4F]/5 border-[#E27D4F]/20' },
                { icon: MapPin, title: 'Explorer', desc: 'Visited 3+ hidden gems', color: 'text-[#0E4D4A]', bg: 'bg-[#0E4D4A]/5 border-[#0E4D4A]/20' },
                { icon: Leaf, title: 'Eco Warrior', desc: 'Maintained 80+ eco score', color: 'text-[#1F3D2B]', bg: 'bg-[#1F3D2B]/5 border-[#1F3D2B]/20' },
                { icon: Users, title: 'Respectful', desc: 'Avoided peak crowd times', color: 'text-[#CB6639]', bg: 'bg-[#CB6639]/5 border-[#CB6639]/20' },
              ].map(badge => (
                <div key={badge.title} className={`p-5 rounded-2xl border ${badge.bg} flex flex-col items-center text-center transition-transform hover:-translate-y-1`}>
                  <div className="w-12 h-12 rounded-full bg-[#FFFFFF] shadow-sm flex items-center justify-center mb-3">
                    <badge.icon className={`w-6 h-6 ${badge.color}`} />
                  </div>
                  <h4 className="font-bold text-sm font-sans text-[#1F3D2B]">{badge.title}</h4>
                  <p className="text-[11px] text-[#6B6B6B] font-sans mt-1.5 leading-relaxed">{badge.desc}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
