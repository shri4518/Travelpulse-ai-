'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { useDestination } from '@/context/destination-context';
import { seedDestinations } from '@/lib/data/seed-destinations';
import { Users, TrendingUp, AlertTriangle, Building, Map, Activity, Download, Settings, BarChart3, LineChart } from 'lucide-react';

export default function AuthorityDashboard() {
  const { user } = useAuth();
  const { currentDestination, setCurrentDestination } = useDestination();
  const activeDest = currentDestination || seedDestinations[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 font-serif">
              <Building className="w-6 h-6 text-primary" />
              Tourism Authority Command Center
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Real-time intelligence for {activeDest.name}, {activeDest.state}</p>
          </div>
          <div className="flex gap-2 items-center">
            <select 
              className="flex h-9 w-40 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring mr-2"
              value={activeDest.id}
              onChange={(e) => {
                const dest = seedDestinations.find(d => d.id === e.target.value);
                if (dest) setCurrentDestination(dest);
              }}
            >
              {seedDestinations.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </motion.div>

      {/* KPI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Tourists', value: '14,205', trend: '+8.2%', color: 'text-secondary', icon: Users },
          { label: 'Local Econ Impact', value: '₹1.2Cr', trend: '+12.4%', color: 'text-primary', icon: TrendingUp },
          { label: 'Avg Sustainability Score', value: '78/100', trend: '+2.1%', color: 'text-primary', icon: Activity },
          { label: 'Active Alerts', value: '2', trend: '-1', color: 'text-accent', icon: AlertTriangle },
        ].map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="glass">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium mb-1">{kpi.label}</p>
                  <div className="flex items-end gap-2">
                    <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
                    <span className="text-xs text-muted-foreground mb-1">{kpi.trend}</span>
                  </div>
                </div>
                <div className={`w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center`}>
                  <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Crowd Intelligence */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="glass border-red-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                Crowd & Load Management Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0 animate-pulse" />
                <div className="flex-1">
                  <h4 className="font-semibold text-red-400">Venna Lake reaching critical capacity</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Current footfall is 150% above average for this time. Waiting times for boating exceed 2 hours.
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white h-8 text-xs border-0">
                      Issue In-App Reroute Alert
                    </Button>
                    <Button size="sm" variant="outline" className="border-red-500/30 text-red-400 h-8 text-xs">
                      Notify Local Police
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold text-amber-400">Traffic bottleneck at Panchgani Toll</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Inbound traffic slowing down significantly. Estimated clearance time: 45 mins.
                  </p>
                  <Button size="sm" variant="outline" className="border-amber-500/30 text-amber-400 h-8 text-xs">
                    Update App ETA Engine
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="glass">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Footfall Trend (7 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[120px] w-full flex items-end gap-2 pt-4">
                  {[40, 45, 55, 50, 70, 95, 85].map((val, i) => (
                    <div key={i} className="flex-1 bg-sky-500/20 rounded-t-sm relative group">
                      <div 
                        className="absolute bottom-0 left-0 right-0 bg-sky-500 rounded-t-sm transition-all duration-500" 
                        style={{ height: `${val}%` }} 
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground mt-2">
                  <span>Mon</span>
                  <span>Sun</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Demographics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 pt-2">
                  {[
                    { label: 'Families', pct: 45, color: 'bg-emerald-500' },
                    { label: 'Couples', pct: 30, color: 'bg-sky-500' },
                    { label: 'Youth/Friends', pct: 20, color: 'bg-amber-500' },
                    { label: 'Solo', pct: 5, color: 'bg-violet-500' },
                  ].map(d => (
                    <div key={d.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span>{d.label}</span>
                        <span className="font-medium">{d.pct}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full ${d.color}`} style={{ width: `${d.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* AI Recommendations for Authority */}
        <div className="space-y-6">
          <Card className="glass h-full">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-sky-400" />
                AI Policy Insights
              </CardTitle>
              <CardDescription>Strategic recommendations based on data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
                <Badge className="bg-sky-500/20 text-sky-400 mb-2 border-0">Opportunity</Badge>
                <h4 className="text-sm font-semibold mb-1">Promote "Heritage Walk"</h4>
                <p className="text-xs text-muted-foreground">
                  AI detects 30% of tourists are seeking low-crowd activities. Promoting the heritage walk can divert 1,200 people daily from peak spots.
                </p>
              </div>
              
              <div className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
                <Badge className="bg-emerald-500/20 text-emerald-400 mb-2 border-0">Sustainability</Badge>
                <h4 className="text-sm font-semibold mb-1">Incentivize Eco-Hotels</h4>
                <p className="text-xs text-muted-foreground">
                  Tourists are actively preferring eco-certified stays, but supply is low (only 12% of hotels). Consider tax incentives for green upgrades.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
                <Badge className="bg-amber-500/20 text-amber-400 mb-2 border-0">Infrastructure</Badge>
                <h4 className="text-sm font-semibold mb-1">Optimize Mapro Garden Parking</h4>
                <p className="text-xs text-muted-foreground">
                  Data shows consistent traffic snarls within 500m of Mapro Garden between 3-6 PM. Smart parking system deployment recommended.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
