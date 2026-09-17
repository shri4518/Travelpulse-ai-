'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Route,
  Brain,
  MapPin,
  Store,
  BarChart3,
  Leaf,
  Shield,
  Heart,
  ArrowRight,
  Sparkles,
  Mountain,
  Cloud,
  Users,
  Search,
  Zap,
  Globe,
  Navigation,
  ChevronRight,
  Star,
  Map,
  Compass
} from 'lucide-react';
import { useState } from 'react';
import { seedDestinations } from '@/lib/data/seed-destinations';
import { useRouter } from 'next/navigation';
import { useDestination } from '@/context/destination-context';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

function HeroSearch() {
  const [query, setQuery] = useState('');
  const router = useRouter();
  const { setCurrentDestination, searchDestinations } = useDestination();
  
  const results = searchDestinations(query).slice(0, 5);

  const handleSelect = (dest: any) => {
    setCurrentDestination(dest);
    router.push('/dashboard');
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 relative z-50">
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative flex items-center bg-card/80 backdrop-blur-xl border border-border rounded-full p-2 shadow-editorial-md">
          <Search className="w-6 h-6 text-[#1F3D2B]/40 ml-4" />
          <Input 
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Where in India do you want to go? (e.g. Goa, Jaipur)" 
            className="border-0 bg-transparent text-lg focus-visible:ring-0 px-4 placeholder:text-[#1F3D2B]/40 h-14 font-sans text-[#1F3D2B]"
          />
          <Button className="h-12 px-8 rounded-full bg-[#E27D4F] hover:bg-[#CB6639] text-white border-0 font-semibold font-sans shadow-sm transition-transform hover:-translate-y-[1px]">
            Plan Trip
          </Button>
        </div>
      </div>

      {query && results.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 right-0 mt-2 bg-background/90 backdrop-blur-2xl border border-border rounded-xl shadow-2xl overflow-hidden p-2 z-50"
        >
          {results.map((dest) => (
            <button
              key={dest.id}
              onClick={() => handleSelect(dest)}
              className="w-full text-left px-4 py-3 hover:bg-muted/50 rounded-lg flex items-center gap-3 transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors shrink-0">
                <MapPin className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="font-semibold">{dest.name}</p>
                <p className="text-xs text-muted-foreground">{dest.state}, {dest.country}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
}

export default function LandingPage() {
  const popularCategories = [
    { icon: Mountain, label: 'Mountains' },
    { icon: Compass, label: 'Beaches' },
    { icon: Store, label: 'Heritage' },
    { icon: Heart, label: 'Romantic' },
    { icon: Zap, label: 'Adventure' },
  ];

  return (
    <div className="min-h-screen flex flex-col overflow-hidden">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background" />
          
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="text-center"
            >
              <motion.div custom={0} variants={fadeUp} className="flex justify-center mb-6">
                <Badge variant="outline" className="px-4 py-1.5 border-[#1F3D2B]/20 bg-[#1F3D2B]/5 text-[#1F3D2B] rounded-full font-sans">
                  <Sparkles className="w-4 h-4 mr-2 text-[#E27D4F]" />
                  India's First AI Tourism Platform
                </Badge>
              </motion.div>
              
              <motion.h1 custom={1} variants={fadeUp} className="text-5xl md:text-7xl font-semibold tracking-tight mb-6 font-serif text-[#1F3D2B]">
                Discover India. <br />
                <span className="italic font-normal">
                  Plan Smarter.
                </span> Travel Better.
              </motion.h1>
              
              <motion.p custom={2} variants={fadeUp} className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                Your AI-powered travel companion. Generate personalized itineraries, estimate budgets, and explore destinations across India instantly.
              </motion.p>
              
              <motion.div custom={3} variants={fadeUp}>
                <HeroSearch />
                
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <span className="text-sm text-muted-foreground self-center mr-2">Trending:</span>
                  {['Goa', 'Jaipur', 'Manali', 'Kerala', 'Kashmir'].map(trend => (
                    <Badge key={trend} variant="secondary" className="bg-muted/50 hover:bg-muted cursor-pointer transition-colors">
                      {trend}
                    </Badge>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* POPULAR CATEGORIES */}
        <section className="py-12 border-y border-border/50 bg-muted/20">
          <div className="max-w-7xl mx-auto px-6 overflow-x-auto hide-scrollbar">
            <div className="flex justify-center gap-6 min-w-max">
              {popularCategories.map((cat, i) => (
                <motion.div 
                  key={cat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex flex-col items-center gap-3 cursor-pointer group"
                >
                  <div className="w-16 h-16 rounded-full bg-card border border-border flex items-center justify-center group-hover:border-primary/50 group-hover:shadow-editorial-sm transition-all">
                    <cat.icon className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <span className="text-sm font-medium">{cat.label}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* DESTINATIONS GRID */}
        <section className="py-24 px-6 relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-semibold mb-4 font-serif">Explore Top Destinations</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">From the beaches of Goa to the peaks of Manali, let AI craft your perfect journey anywhere in India.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {seedDestinations.slice(0, 8).map((dest, i) => (
                <motion.div
                  key={dest.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="glass overflow-hidden h-full group cursor-pointer hover:border-primary/30 transition-all rounded-2xl">
                    <div className="h-48 relative overflow-hidden bg-muted">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                      <div className="absolute bottom-4 left-4 z-20">
                        <h3 className="text-xl font-bold text-white font-serif">{dest.name}</h3>
                        <p className="text-xs text-white/80">{dest.state}</p>
                      </div>
                      <Badge className="absolute top-4 right-4 z-20 bg-background/50 backdrop-blur-md border-0 rounded-full">
                        <Star className="w-3 h-3 text-accent mr-1 fill-accent" /> 4.8
                      </Badge>
                      {/* Fake Image Background */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-secondary/80 group-hover:scale-110 transition-transform duration-700" />
                    </div>
                    <CardContent className="p-4">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {dest.categories.slice(0, 2).map(cat => (
                          <span key={cat} className="text-[10px] px-2 py-1 rounded-md bg-muted text-muted-foreground font-medium">
                            {cat}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center">
                          <MapPin className="w-3 h-3 mr-1" /> {dest.average_budget_per_day}/day
                        </span>
                        <ArrowRight className="w-4 h-4 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-12 text-center">
              <Button variant="outline" size="lg" className="rounded-full">
                View All Destinations <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </section>

        {/* ECOSYSTEM SECTION */}
        <section className="py-24 px-6 relative overflow-hidden bg-muted/10 border-t border-border">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4">The Platform</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">An Intelligent Ecosystem</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Connecting tourists, businesses, and authorities for sustainable tourism across India.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: 'For Tourists', icon: Route, desc: 'AI-generated dynamic itineraries, real-time weather & crowd alerts, and transparent budgeting.', color: 'emerald' },
                { title: 'For Local Businesses', icon: Store, desc: 'Predictive demand analytics, direct exposure to targeted tourists, and reputation management.', color: 'sky' },
                { title: 'For Authorities', icon: BarChart3, desc: 'Live load management, capacity alerts, and data-driven policy insights for sustainability.', color: 'amber' }
              ].map((role, i) => (
                <motion.div key={role.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.2 }}>
                  <Card className="bg-[#FFFFFF] h-full relative overflow-hidden group shadow-editorial-md border-0 rounded-2xl">
                    <CardContent className="p-8">
                      <div className="w-14 h-14 rounded-full bg-[#FAF7F2] flex items-center justify-center mb-6 border border-[#1F3D2B]/10">
                        <role.icon className="w-6 h-6 text-[#1F3D2B]" />
                      </div>
                      <h3 className="text-xl font-bold mb-3 font-serif text-[#1F3D2B]">{role.title}</h3>
                      <p className="text-[#6B6B6B] font-sans">{role.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-24 px-6 bg-[#1F3D2B] text-[#FAF7F2]">
          <div className="max-w-4xl mx-auto text-center">
            <div className="rounded-3xl p-12 relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-bold mb-6 font-serif">Ready to reinvent how you travel?</h2>
                <p className="text-lg text-[#FAF7F2]/80 mb-8 font-sans">Join the intelligence revolution in Indian tourism today.</p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Button size="lg" className="h-12 px-8 bg-[#E27D4F] hover:bg-[#CB6639] text-white border-0 font-bold rounded-full font-sans" asChild>
                    <Link href="/signup">Start Planning Free</Link>
                  </Button>
                  <Button size="lg" variant="outline" className="h-12 px-8 rounded-full font-sans border-[#FAF7F2]/30 text-[#FAF7F2] hover:bg-[#FAF7F2]/10 hover:text-white" asChild>
                    <Link href="/login">Demo Login</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
