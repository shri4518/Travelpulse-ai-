'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { Users, TrendingUp, Star, ShieldCheck, MapPin, IndianRupee, Bell, ExternalLink } from 'lucide-react';
import { seedBusinesses } from '@/lib/data/seed-businesses';

export default function BusinessDashboard() {
  const { user } = useAuth();
  
  // Assume the first business belongs to this user for demo purposes
  const myBusiness = seedBusinesses[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Business Hub</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage your presence in the intelligent ecosystem</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-amber-500/30 text-amber-400">
              <Bell className="w-4 h-4 mr-2" />
              Campaigns
            </Button>
            <Button className="gradient-forest text-white border-0">
              Edit Profile
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Business Profile Overview */}
      <Card className="glass overflow-hidden border-emerald-500/20">
        <div className="h-24 bg-gradient-to-r from-emerald-500/20 to-sky-500/20" />
        <CardContent className="px-6 py-4 relative">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-24 h-24 rounded-2xl bg-card border-4 border-background -mt-12 shadow-xl flex items-center justify-center shrink-0">
              <Store className="w-10 h-10 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold">{myBusiness.name}</h2>
                {myBusiness.is_verified && (
                  <Badge variant="outline" className="text-[10px] border-green-500/30 text-green-400">
                    <ShieldCheck className="w-3 h-3 mr-1" /> Verified Partner
                  </Badge>
                )}
                {myBusiness.eco_certified && (
                  <Badge variant="outline" className="text-[10px] border-sky-500/30 text-sky-400">
                    Eco Certified
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground max-w-2xl">{myBusiness.description}</p>
              
              <div className="flex flex-wrap gap-4 mt-4 text-sm font-medium">
                <span className="flex items-center gap-1 text-amber-400">
                  <Star className="w-4 h-4 fill-amber-400" /> {myBusiness.rating} ({myBusiness.reviews} reviews)
                </span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="w-4 h-4" /> {myBusiness.location}
                </span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <IndianRupee className="w-4 h-4" /> ₹{myBusiness.price_per_unit} {myBusiness.category === 'hotel' ? '/night' : '/person'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'AI Recommendations', value: '482', sub: '+12% this week', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
          { label: 'Profile Views', value: '1,204', sub: '+5% this week', icon: Users, color: 'text-sky-400', bg: 'bg-sky-400/10' },
          { label: 'Est. Bookings', value: '86', sub: 'Via TravelPulse', icon: Star, color: 'text-amber-400', bg: 'bg-amber-400/10' },
          { label: 'Eco Impact Score', value: 'A-', sub: 'Top 20% in region', icon: Leaf, color: 'text-green-400', bg: 'bg-green-400/10' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="glass">
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{stat.sub}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Insights */}
        <div className="lg:col-span-2">
          <Card className="glass h-full">
            <CardHeader>
              <CardTitle className="text-lg">AI Business Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <h4 className="font-semibold text-amber-400 flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4" /> Demand Surge Expected
                </h4>
                <p className="text-sm text-muted-foreground">
                  Based on current AI itinerary generations, expect a 40% increase in footfall this weekend due to the strawberry festival. Ensure adequate staffing.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <h4 className="font-semibold text-emerald-400 flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4" /> Audience Shift
                </h4>
                <p className="text-sm text-muted-foreground">
                  TravelPulse AI is recommending your business to more &apos;Adventure&apos; and &apos;Youth&apos; demographics recently. Consider adding high-energy combo packages.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/20">
                <h4 className="font-semibold text-sky-400 flex items-center gap-2 mb-1">
                  <Star className="w-4 h-4" /> Reputation Management
                </h4>
                <p className="text-sm text-muted-foreground">
                  Recent reviews highlight your excellent service but mention slightly slow wait times during peak hours (1-3 PM).
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Center */}
        <div>
          <Card className="glass h-full">
            <CardHeader>
              <CardTitle className="text-lg">Action Center</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Profile Completion</span>
                  <span className="text-emerald-400 font-bold">85%</span>
                </div>
                <Progress value={85} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">Add high-resolution photos to reach 100% and boost AI ranking.</p>
              </div>

              <div className="pt-4 space-y-2 border-t border-border">
                <Button variant="outline" className="w-full justify-between group">
                  Update Menu / Pricing
                  <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                </Button>
                <Button variant="outline" className="w-full justify-between group">
                  Apply for Eco-Certification
                  <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                </Button>
                <Button variant="outline" className="w-full justify-between group">
                  Manage Availability
                  <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Needed imports at the top
import { Store, Leaf } from 'lucide-react';
