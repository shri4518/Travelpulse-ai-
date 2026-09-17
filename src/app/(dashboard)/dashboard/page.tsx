'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/auth-context';
import { useSimulation } from '@/context/simulation-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { getItineraryForDestination } from '@/lib/data/seed-itineraries';
import { seedBusinesses } from '@/lib/data/seed-businesses';
import { seedAttractions } from '@/lib/data/seed-attractions';
import { WEATHER_IMPACT, EMERGENCY_CONTACTS } from '@/lib/constants';
import { useDestination } from '@/context/destination-context';
import {
  MapPin,
  Cloud,
  IndianRupee,
  Route,
  Store,
  Leaf,
  Shield,
  ArrowRight,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Phone,
  Star,
  Navigation,
} from 'lucide-react';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.4 },
  }),
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { state: sim } = useSimulation();

  const { currentDestination } = useDestination();
  const activeDest = currentDestination;
  
  if (!activeDest) {
    return (
      <div className="space-y-6">
        <motion.div initial="hidden" animate="visible" variants={fadeIn} custom={0}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold font-serif text-[#1F3D2B]">
                Welcome back, <span className="text-[#E27D4F]">{user?.full_name?.split(' ')[0] || 'Traveler'}</span>
              </h1>
              <p className="text-[#6B6B6B] mt-1 font-sans">Please select a destination to view your dashboard</p>
            </div>
            <Link href="/trip-planner">
              <Button className="bg-[#E27D4F] hover:bg-[#CB6639] text-white border-0 rounded-full font-sans shadow-sm">
                <Route className="w-4 h-4 mr-2" />
                Plan New Trip
              </Button>
            </Link>
          </div>
        </motion.div>
        
        <div className="p-12 text-center border border-border rounded-xl bg-muted/20 mt-8">
          <p className="text-muted-foreground">Select a destination from the search bar to view your travel intelligence overview.</p>
        </div>
      </div>
    );
  }

  const trip = getItineraryForDestination(activeDest.id, activeDest.name);
  const completedItems = trip.items.filter(i => i.status === 'completed').length;
  const totalItems = trip.items.length;
  const completedCost = trip.items
    .filter(i => i.status === 'completed')
    .reduce((sum, i) => sum + i.estimated_cost, 0);
  const remainingBudget = trip.budget - completedCost;
  const progressPct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const weatherInfo = WEATHER_IMPACT[sim.weather];

  // Recommended experiences (random businesses)
  const recommended = seedBusinesses.filter(b => b.destination_id === activeDest.id && ['experience', 'adventure', 'guide'].includes(b.category)).slice(0, 3);
  const hiddenGems = seedAttractions.filter(a => a.destination_id === activeDest.id && a.is_hidden_gem).slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <motion.div initial="hidden" animate="visible" variants={fadeIn} custom={0}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold font-serif text-[#1F3D2B]">
              Welcome back, <span className="text-[#E27D4F]">{user?.full_name?.split(' ')[0] || 'Traveler'}</span>
            </h1>
            <p className="text-[#6B6B6B] mt-1 font-sans">Here&apos;s your travel intelligence overview</p>
          </div>
          <Link href="/trip-planner">
            <Button className="bg-[#E27D4F] hover:bg-[#CB6639] text-white border-0 rounded-full font-sans shadow-sm">
              <Route className="w-4 h-4 mr-2" />
              Plan New Trip
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Weather Alert */}
      {sim.weather !== 'normal' && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-400">⚠ Weather Alert</p>
              <p className="text-xs text-muted-foreground">
                {sim.weather === 'rain'
                  ? 'Light rainfall expected. Outdoor activities may be affected.'
                  : 'Heavy rainfall expected around 3 PM. Consider indoor alternatives.'}
              </p>
            </div>
            <Link href={`/trip/${trip.id}`} className="ml-auto shrink-0">
              <Button size="sm" variant="outline" className="text-xs border-amber-500/30 text-amber-400">
                Optimize Trip
              </Button>
            </Link>
          </div>
        </motion.div>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: 'Trip Progress',
            value: `${completedItems}/${totalItems}`,
            subtitle: `${progressPct}% completed`,
            icon: MapPin,
            color: 'text-[#0E4D4A]',
            bg: 'bg-[#0E4D4A]/10',
          },
          {
            title: 'Budget',
            value: `₹${completedCost.toLocaleString()}`,
            subtitle: `₹${remainingBudget.toLocaleString()} remaining`,
            icon: IndianRupee,
            color: 'text-[#E27D4F]',
            bg: 'bg-[#E27D4F]/10',
          },
          {
            title: 'Weather',
            value: weatherInfo.label,
            subtitle: sim.weather === 'normal' ? 'Great for outdoor activities' : 'Check activity suitability',
            icon: Cloud,
            color: 'text-[#A9C9D6]',
            bg: 'bg-[#A9C9D6]/20',
          },
          {
            title: 'Sustainability',
            value: `${trip.sustainability_score}/100`,
            subtitle: 'Eco-friendliness score',
            icon: Leaf,
            color: 'text-[#1F3D2B]',
            bg: 'bg-[#1F3D2B]/10',
          },
        ].map((stat, i) => (
          <motion.div key={stat.title} variants={fadeIn} custom={i + 1} initial="hidden" animate="visible">
            <Card className="glass hover:border-emerald-500/10 transition-all">
              <CardContent className="p-4 lg:p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center`}>
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                  <span className="text-xs text-muted-foreground">{stat.title}</span>
                </div>
                <p className="text-xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Trip Card + Impact */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Trip */}
        <motion.div variants={fadeIn} custom={5} initial="hidden" animate="visible" className="lg:col-span-2">
          <Card className="glass">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-400" />
                  Current Trip
                </CardTitle>
                <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">
                  Active
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{trip.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {trip.origin} → {trip.destination} · {trip.duration_days} days · {trip.travelers} travelers
                </p>
              </div>

              <Progress value={progressPct} className="h-2" />

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-lg bg-[#FAF7F2] border border-[#1F3D2B]/10 p-3 shadow-editorial-sm">
                  <p className="text-xs text-[#6B6B6B]">Spent</p>
                  <p className="text-sm font-bold text-[#1F3D2B]">₹{completedCost.toLocaleString()}</p>
                </div>
                <div className="rounded-lg bg-[#FAF7F2] border border-[#1F3D2B]/10 p-3 shadow-editorial-sm">
                  <p className="text-xs text-[#6B6B6B]">Remaining</p>
                  <p className="text-sm font-bold text-[#E27D4F]">₹{remainingBudget.toLocaleString()}</p>
                </div>
                <div className="rounded-lg bg-[#FAF7F2] border border-[#1F3D2B]/10 p-3 shadow-editorial-sm">
                  <p className="text-xs text-[#6B6B6B]">Distance</p>
                  <p className="text-sm font-bold text-[#1F3D2B]">{trip.total_distance_km} km</p>
                </div>
                <div className="rounded-lg bg-[#FAF7F2] border border-[#1F3D2B]/10 p-3 shadow-editorial-sm">
                  <p className="text-xs text-[#6B6B6B]">Local Biz</p>
                  <p className="text-sm font-bold text-[#1F3D2B]">{trip.local_businesses_count}</p>
                </div>
              </div>

              <Link href={`/trip/${trip.id}`}>
                <Button variant="outline" className="w-full rounded-full border-[#1F3D2B]/20 text-[#1F3D2B] hover:bg-[#1F3D2B]/5">
                  View Live Trip
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        {/* Impact Summary */}
        <motion.div variants={fadeIn} custom={6} initial="hidden" animate="visible">
          <Card className="glass h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-400" />
                Your Impact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'Local Spending', value: `₹${completedCost.toLocaleString()}`, icon: Store },
                { label: 'Businesses Supported', value: `${trip.local_businesses_count}`, icon: Store },
                { label: 'Hidden Gems Visited', value: '2', icon: Star },
                { label: 'Est. CO₂ Saved', value: '1.2 kg', icon: Leaf },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <item.icon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                  </div>
                  <span className="text-sm font-medium">{item.value}</span>
                </div>
              ))}
              <p className="text-[10px] text-muted-foreground italic">
                * Estimates based on demo data
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recommended Experiences */}
      <motion.div variants={fadeIn} custom={7} initial="hidden" animate="visible">
        <Card className="glass">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Navigation className="w-5 h-5 text-sky-400" />
                Recommended Experiences
              </CardTitle>
              <Link href="/businesses">
                <Button variant="ghost" size="sm" className="text-xs text-[#E27D4F] hover:text-[#CB6639] hover:bg-[#E27D4F]/10">
                  View All <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {recommended.map(biz => (
                <div key={biz.id} className="rounded-xl bg-muted/30 p-4 hover:bg-muted/50 transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-[10px] capitalize border-[#1F3D2B]/20 text-[#1F3D2B] bg-[#FAF7F2]">{biz.category}</Badge>
                    <span className="text-xs text-muted-foreground ml-auto flex items-center gap-1">
                      <Star className="w-3 h-3 text-[#E27D4F]" />
                      {biz.rating}
                    </span>
                  </div>
                  <h4 className="font-medium text-sm mb-1 text-[#1F3D2B]">{biz.name}</h4>
                  <p className="text-xs text-[#6B6B6B] line-clamp-2">{biz.description}</p>
                  <p className="text-xs font-semibold text-[#0E4D4A] mt-2">₹{biz.price_per_unit}/person</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Hidden Gems + Safety */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hidden Gems */}
        <motion.div variants={fadeIn} custom={8} initial="hidden" animate="visible">
          <Card className="glass h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400" />
                Hidden Gems Near You
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {hiddenGems.map(gem => (
                <div key={gem.id} className="flex items-center gap-3 rounded-lg bg-muted/30 p-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-400/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{gem.name}</p>
                    <p className="text-xs text-muted-foreground">{gem.visitors_today} visitors · Score: {gem.tourism_score}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] border-green-500/30 text-green-400 shrink-0">
                    {gem.crowd_level}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Safety */}
        <motion.div variants={fadeIn} custom={9} initial="hidden" animate="visible">
          <Card className="glass h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-400" />
                Safety & Emergency
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {EMERGENCY_CONTACTS.slice(0, 4).map(contact => (
                <div key={contact.name} className="flex items-center justify-between rounded-lg bg-muted/30 p-3">
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-red-400" />
                    <div>
                      <p className="text-sm font-medium">{contact.name}</p>
                      <p className="text-xs text-muted-foreground">{contact.number}</p>
                    </div>
                  </div>
                  <a href={`tel:${contact.number}`}>
                    <Button size="sm" variant="outline" className="text-xs border-red-500/30 text-red-400">
                      Call
                    </Button>
                  </a>
                </div>
              ))}
              <Link href="/safety">
                <Button variant="ghost" size="sm" className="w-full text-xs mt-2">
                  View All Safety Info <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
