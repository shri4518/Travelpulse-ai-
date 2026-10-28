'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { seedBusinesses } from '@/lib/data/seed-businesses';
import { Store, Search, Filter, Star, MapPin, IndianRupee, ShieldCheck } from 'lucide-react';

const CATEGORIES = ['all', 'hotel', 'restaurant', 'guide', 'experience', 'transport'];

import { useDestination } from '@/context/destination-context';

export default function BusinessesPage() {
  const { currentDestination } = useDestination();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [businesses, setBusinesses] = useState<any[]>(seedBusinesses);

  useEffect(() => {
    async function loadDbBusinesses() {
      try {
        const res = await fetch('/api/admin/businesses?status=APPROVED');
        if (res.ok) {
          const json = await res.json();
          if (json.businesses && json.businesses.length > 0) {
            setBusinesses(json.businesses);
          }
        }
      } catch (err) {
        console.error('Failed to load approved businesses from database:', err);
      }
    }
    loadDbBusinesses();
  }, []);

  const filteredBusinesses = businesses.filter(b => {
    const matchesDest = !currentDestination || b.destination_id === currentDestination.id;
    const matchesSearch = b.name.toLowerCase().includes(search.toLowerCase()) || 
                          (b.description && b.description.toLowerCase().includes(search.toLowerCase()));
    const matchesCat = category === 'all' || b.category === category;
    return matchesDest && matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2 font-serif text-[#1F3D2B]">
              <Store className="w-6 h-6 text-[#E27D4F]" />
              {currentDestination ? `${currentDestination.name} Ecosystem` : 'Local Business Ecosystem'}
            </h1>
            <p className="text-[#6B6B6B] font-sans mt-1">
              Support verified local businesses {currentDestination ? `in ${currentDestination.name}` : ''}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6B6B]" />
              <Input 
                placeholder="Search businesses..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10 h-10 rounded-full border-[#1F3D2B]/20 bg-[#FAF7F2] font-sans"
              />
            </div>
            <Button variant="outline" className="shrink-0 h-10 rounded-full border-[#1F3D2B]/20 text-[#1F3D2B] hover:bg-[#FAF7F2] font-sans px-5">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Category filters */}
      <div className="flex overflow-x-auto pb-2 gap-3 hide-scrollbar">
        {CATEGORIES.map(cat => (
          <Button
            key={cat}
            variant={category === cat ? 'default' : 'outline'}
            onClick={() => setCategory(cat)}
            className={`capitalize rounded-full font-sans transition-all px-5 ${
              category === cat 
                ? 'bg-[#1F3D2B] text-white border-0 shadow-sm hover:bg-[#0E4D4A]' 
                : 'border-[#1F3D2B]/20 text-[#1F3D2B] hover:bg-[#FAF7F2]'
            }`}
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredBusinesses.map((biz, i) => (
          <motion.div 
            key={biz.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="bg-[#FFFFFF] border-0 shadow-editorial-sm rounded-2xl h-full flex flex-col hover:shadow-editorial-md transition-all group cursor-pointer overflow-hidden">
              <div className="h-40 bg-[#FAF7F2] relative overflow-hidden flex items-center justify-center border-b border-[#1F3D2B]/5">
                <Store className="w-12 h-12 text-[#1F3D2B]/20 group-hover:scale-110 transition-transform" />
                {biz.is_verified && (
                  <div className="absolute top-3 right-3 bg-[#FFFFFF]/90 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1.5 text-[10px] font-sans font-medium text-[#0E4D4A] border border-[#0E4D4A]/20 shadow-sm">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified Local
                  </div>
                )}
                <div className="absolute bottom-3 left-3 flex gap-2">
                  <Badge variant="secondary" className="capitalize text-[10px] font-sans px-2.5 py-0.5 rounded-full bg-[#FFFFFF]/90 text-[#1F3D2B] border border-[#1F3D2B]/10 backdrop-blur-sm shadow-sm">
                    {biz.category}
                  </Badge>
                  {biz.eco_certified && (
                    <Badge variant="secondary" className="text-[10px] font-sans px-2.5 py-0.5 rounded-full bg-[#0E4D4A]/10 text-[#0E4D4A] border border-[#0E4D4A]/20 backdrop-blur-sm shadow-sm">
                      Eco-Certified
                    </Badge>
                  )}
                </div>
              </div>
              
              <CardContent className="p-5 flex-1">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-lg font-serif text-[#1F3D2B] line-clamp-1">{biz.name}</h3>
                  <div className="flex items-center gap-1 text-sm font-medium font-sans shrink-0 bg-[#FAF7F2] px-2 py-0.5 rounded-md border border-[#1F3D2B]/10">
                    <Star className="w-3.5 h-3.5 text-[#E27D4F] fill-[#E27D4F]" />
                    <span className="text-[#1F3D2B]">{biz.rating}</span>
                  </div>
                </div>
                
                <p className="text-sm text-[#6B6B6B] font-sans mb-5 line-clamp-2 min-h-[2.5rem] leading-relaxed">
                  {biz.description}
                </p>
                
                <div className="space-y-2 mt-auto font-sans">
                  <div className="flex items-center text-sm text-[#6B6B6B]">
                    <MapPin className="w-4 h-4 mr-2 text-[#E27D4F] shrink-0" />
                    <span className="truncate">{biz.location}</span>
                  </div>
                  <div className="flex items-center text-sm text-[#6B6B6B]">
                    <IndianRupee className="w-4 h-4 mr-2 text-[#1F3D2B] shrink-0" />
                    <span className="text-[#1F3D2B] font-medium">₹{biz.price_per_unit}</span>
                    <span className="ml-1 text-[#6B6B6B]">{biz.category === 'hotel' ? '/ night' : '/ person'}</span>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="p-5 pt-0 border-t border-[#1F3D2B]/5 mt-4">
                <Button className="w-full h-11 bg-[#0E4D4A] hover:bg-[#1F3D2B] text-white rounded-full font-sans shadow-sm border-0 mt-4 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                  View Details
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
