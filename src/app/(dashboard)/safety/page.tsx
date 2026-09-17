'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Phone, AlertTriangle, MapPin, Search, Navigation } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { EMERGENCY_CONTACTS } from '@/lib/constants';
import { seedSafetyFacilities } from '@/lib/data/seed-safety';
import { useDestination } from '@/context/destination-context';
import { seedDestinations } from '@/lib/data/seed-destinations';
import { useState } from 'react';

export default function SafetyPage() {
  const { currentDestination } = useDestination();
  const activeDest = currentDestination;
  const [searchQuery, setSearchQuery] = useState('');

  const facilities = activeDest 
    ? seedSafetyFacilities.filter(s => 
        s.destination_id === activeDest.id &&
        (s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
         s.type.includes(searchQuery.toLowerCase()))
      )
    : [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 rounded-full bg-[#FAF7F2] flex items-center justify-center border border-[#CB6639]/20 shadow-editorial-sm">
            <Shield className="w-6 h-6 text-[#CB6639]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-serif text-[#1F3D2B]">Tourist Safety & Emergency</h1>
            <p className="text-[#6B6B6B] font-sans mt-1">Quick access to emergency services and safety facilities</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Emergency Contacts - Priority */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="bg-[#FFFFFF] border-l-4 border-l-[#CB6639] border-y-0 border-r-0 shadow-editorial-md rounded-2xl overflow-hidden">
            <CardHeader className="bg-[#FAF7F2]/50 pb-4">
              <CardTitle className="text-xl flex items-center gap-2 font-serif text-[#1F3D2B]">
                <AlertTriangle className="w-5 h-5 text-[#CB6639]" />
                Emergency Hotlines
              </CardTitle>
              <CardDescription className="text-[#6B6B6B] font-sans">Tap to call immediately</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4 p-5">
              {EMERGENCY_CONTACTS.map((contact, i) => (
                <motion.a
                  key={contact.name}
                  href={`tel:${contact.number}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-[#FAF7F2] hover:bg-[#FAF7F2]/80 transition-colors border border-[#1F3D2B]/5 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#CB6639]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Phone className="w-4 h-4 text-[#CB6639]" />
                    </div>
                    <div>
                      <p className="font-bold font-serif text-[#1F3D2B]">{contact.name}</p>
                      <p className="text-sm text-[#CB6639] font-mono font-medium">{contact.number}</p>
                    </div>
                  </div>
                  <Button size="sm" className="bg-[#CB6639] hover:bg-[#b05228] text-white rounded-full font-sans border-0">
                    Call
                  </Button>
                </motion.a>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Nearby Facilities */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <h2 className="text-2xl font-bold font-serif text-[#1F3D2B]">
              {activeDest ? `Safety Facilities in ${activeDest.name}` : 'Safety Facilities Map'}
            </h2>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6B6B]" />
              <Input 
                placeholder="Search hospitals, police..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10 h-10 rounded-full border-[#1F3D2B]/20 bg-[#FAF7F2] font-sans"
              />
            </div>
          </div>

          {!activeDest && (
            <div className="p-8 text-center border border-[#1F3D2B]/10 rounded-2xl bg-[#FFFFFF] shadow-editorial-sm">
              <p className="text-[#6B6B6B] font-sans">Please select a destination from the search on the Discover page or map to view local safety facilities.</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {facilities.map((facility, i) => (
              <motion.div
                key={facility.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="bg-[#FFFFFF] border-0 shadow-editorial-sm rounded-2xl h-full hover:shadow-editorial-md transition-shadow">
                  <CardContent className="p-5 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg font-serif text-[#1F3D2B]">{facility.name}</h3>
                        <p className="text-sm text-[#6B6B6B] font-sans flex items-center gap-1.5 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-[#E27D4F]" />
                          {facility.address || `${activeDest.name} region`}
                        </p>
                      </div>
                      <Badge variant="outline" className={`capitalize text-[10px] px-2 py-0.5 rounded-full shrink-0 font-sans ${
                        facility.type === 'hospital' || facility.type === 'clinic' 
                          ? 'text-[#0E4D4A] border-[#0E4D4A]/20 bg-[#0E4D4A]/5' 
                          : 'text-[#CB6639] border-[#CB6639]/30 bg-[#CB6639]/5'
                      }`}>
                        {facility.type}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 mt-auto font-sans text-sm text-[#1F3D2B]">
                      {facility.phone && (
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-2 text-[#0E4D4A] shrink-0" />
                          <span className="font-mono">{facility.phone}</span>
                        </div>
                      )}
                      
                      {facility.hours && (
                        <div className="flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-2 text-[#CB6639] shrink-0" />
                          <span>{facility.hours}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-[#E27D4F] shrink-0" />
                        <span>Available on Map</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 mt-5 pt-5 border-t border-[#1F3D2B]/5">
                      {facility.phone && (
                        <Button variant="outline" size="sm" className="flex-1 rounded-full border-[#1F3D2B]/20 text-[#1F3D2B] hover:bg-[#FAF7F2] font-sans h-10" asChild>
                          <a href={`tel:${facility.phone}`}>
                            <Phone className="w-4 h-4 mr-2" /> Call
                          </a>
                        </Button>
                      )}
                      <Button className="flex-1 rounded-full bg-[#0E4D4A] hover:bg-[#1F3D2B] text-white font-sans h-10 border-0">
                        <Navigation className="w-4 h-4 mr-2" /> Navigate
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
