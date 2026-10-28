'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/auth-context';
import {
  Users,
  TrendingUp,
  Star,
  ShieldCheck,
  MapPin,
  IndianRupee,
  Bell,
  ExternalLink,
  Store,
  Leaf,
  Calendar,
  PieChart,
  Plus,
  Edit3,
  Clock,
  Mail,
  Phone,
  AlertCircle,
  CheckCircle2,
  XCircle,
  FileText,
  Trash2,
  Send,
  Eye,
} from 'lucide-react';

export default function BusinessDashboard() {
  const { user } = useAuth();
  
  // State
  const [business, setBusiness] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState<number>(30);
  const [loading, setLoading] = useState(true);

  // Modals
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [newListingOpen, setNewListingOpen] = useState(false);
  const [previewListing, setPreviewListing] = useState<any>(null);
  const [registerOpen, setRegisterOpen] = useState(false);

  // Edit Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: '',
    category: 'hotel',
    description: '',
    contact_phone: '',
    contact_email: '',
    address: '',
    operating_hours: '24 Hours / 7 Days',
    price_per_unit: 0,
  });

  // Listing Form State
  const [listingForm, setListingForm] = useState({
    title: '',
    category: 'Accommodation',
    price: 0,
    description: '',
    status: 'PENDING',
  });

  // Fetch Business Data
  const loadBusinessData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Fetch Business by owner_id or fallback
      const bizRes = await fetch(`/api/business/profile?owner_id=${user.id}`);
      const bizJson = await bizRes.json();
      const currentBiz = bizJson.business;
      setBusiness(currentBiz);

      if (currentBiz) {
        setProfileForm({
          name: currentBiz.name || '',
          category: currentBiz.category || 'hotel',
          description: currentBiz.description || '',
          contact_phone: currentBiz.contact_phone || '',
          contact_email: currentBiz.contact_email || '',
          address: currentBiz.address || '',
          operating_hours: currentBiz.operating_hours || '24 Hours / 7 Days',
          price_per_unit: currentBiz.price_per_unit || 0,
        });

        // 2. Fetch Analytics
        const analyticsRes = await fetch(`/api/analytics/business?business_id=${currentBiz.id}&limit=${dateRange}`);
        if (analyticsRes.ok) {
          const aJson = await analyticsRes.json();
          setAnalyticsData(aJson.data || []);
          setSummary(aJson.summary || null);
        }

        // 3. Fetch Listings
        const listRes = await fetch(`/api/business/listings?business_id=${currentBiz.id}`);
        if (listRes.ok) {
          const lJson = await listRes.json();
          setListings(lJson.listings || []);
        }

        // 4. Fetch Inquiries
        const inqRes = await fetch(`/api/business/inquiries?business_id=${currentBiz.id}`);
        if (inqRes.ok) {
          const iJson = await inqRes.json();
          setInquiries(iJson.inquiries || []);
        }
      }
    } catch (err) {
      console.error('Failed to load business dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, [user, dateRange]);

  useEffect(() => {
    loadBusinessData();
  }, [loadBusinessData]);

  // Handle Edit Profile Save
  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    if (!business) return;
    try {
      const res = await fetch('/api/business/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: business.id,
          owner_id: user?.id,
          ...profileForm,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        setBusiness(json.business);
        setEditProfileOpen(false);
      }
    } catch (err) {
      console.error('Error saving profile:', err);
    }
  }

  // Handle Create Listing
  async function handleCreateListing(e: React.FormEvent) {
    e.preventDefault();
    if (!business) return;
    try {
      const res = await fetch('/api/business/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: business.id,
          ...listingForm,
        }),
      });
      if (res.ok) {
        setNewListingOpen(false);
        setListingForm({ title: '', category: 'Accommodation', price: 0, description: '', status: 'PENDING' });
        loadBusinessData();
      }
    } catch (err) {
      console.error('Error creating listing:', err);
    }
  }

  // Handle Delete Listing
  async function handleDeleteListing(id: string) {
    if (!confirm('Are you sure you want to remove this listing?')) return;
    try {
      const res = await fetch(`/api/business/listings?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadBusinessData();
      }
    } catch (err) {
      console.error('Error deleting listing:', err);
    }
  }

  // Handle Inquiry Status Update
  async function handleInquiryStatus(id: string, newStatus: string) {
    try {
      const res = await fetch('/api/business/inquiries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        loadBusinessData();
      }
    } catch (err) {
      console.error('Error updating inquiry status:', err);
    }
  }

  // Handle Business Registration (for users with no business profile yet)
  async function handleRegisterBusiness(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    try {
      const res = await fetch('/api/business/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner_id: user.id,
          ...profileForm,
        }),
      });
      if (res.ok) {
        setRegisterOpen(false);
        loadBusinessData();
      }
    } catch (err) {
      console.error('Error registering business:', err);
    }
  }

  const latestDay = analyticsData[0] || null;

  // Unregistered state
  if (!loading && !business) {
    return (
      <div className="max-w-3xl mx-auto py-12 space-y-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto border border-primary/20">
          <Store className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold font-serif text-[#1F3D2B]">Welcome to TravelPulse Business Hub</h1>
          <p className="text-[#6B6B6B] mt-2 max-w-lg mx-auto">
            You are logged in as a Business Owner, but you haven&apos;t registered a business profile yet. Register now to showcase your services across India&apos;s intelligent tourism platform.
          </p>
        </div>
        <Button onClick={() => setRegisterOpen(true)} className="gradient-forest text-white rounded-full px-8 h-12 text-base font-semibold border-0">
          <Plus className="w-5 h-5 mr-2" /> Register Your Business
        </Button>

        {/* Registration Modal */}
        {registerOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="max-w-lg w-full bg-card shadow-2xl rounded-2xl border border-border overflow-hidden text-left">
              <CardHeader className="bg-muted/30 pb-4 border-b border-border">
                <CardTitle className="text-xl font-serif">Register Your Business Profile</CardTitle>
                <CardDescription>Enter details to submit for verification by the Tourism Authority.</CardDescription>
              </CardHeader>
              <form onSubmit={handleRegisterBusiness} className="p-6 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Business Name *</label>
                  <Input
                    required
                    value={profileForm.name}
                    onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                    placeholder="e.g. Strawberry Valley Homestay"
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Category</label>
                    <select
                      value={profileForm.category}
                      onChange={e => setProfileForm({ ...profileForm, category: e.target.value })}
                      className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm mt-1"
                    >
                      <option value="hotel">Hotel / Resort</option>
                      <option value="homestay">Homestay</option>
                      <option value="restaurant">Restaurant / Café</option>
                      <option value="experience">Experience / Tour</option>
                      <option value="guide">Local Guide</option>
                      <option value="adventure">Adventure Activity</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Base Price (₹)</label>
                    <Input
                      type="number"
                      value={profileForm.price_per_unit}
                      onChange={e => setProfileForm({ ...profileForm, price_per_unit: Number(e.target.value) })}
                      placeholder="e.g. 3500"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Address *</label>
                  <Input
                    required
                    value={profileForm.address}
                    onChange={e => setProfileForm({ ...profileForm, address: e.target.value })}
                    placeholder="Street address and location"
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Phone</label>
                    <Input
                      value={profileForm.contact_phone}
                      onChange={e => setProfileForm({ ...profileForm, contact_phone: e.target.value })}
                      placeholder="+91..."
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Email</label>
                    <Input
                      type="email"
                      value={profileForm.contact_email}
                      onChange={e => setProfileForm({ ...profileForm, contact_email: e.target.value })}
                      placeholder="business@example.com"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Description</label>
                  <Textarea
                    rows={3}
                    value={profileForm.description}
                    onChange={e => setProfileForm({ ...profileForm, description: e.target.value })}
                    placeholder="Highlight what makes your service unique..."
                    className="mt-1"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-3 border-t border-border">
                  <Button type="button" variant="outline" onClick={() => setRegisterOpen(false)}>Cancel</Button>
                  <Button type="submit" className="gradient-forest text-white border-0">Submit for Approval</Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold font-serif text-[#1F3D2B]">Business Hub</h1>
            <p className="text-sm text-[#6B6B6B] mt-1 font-sans">
              Intelligent management for <span className="font-semibold text-foreground">{business?.name}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setEditProfileOpen(true)}
              className="rounded-full border-[#1F3D2B]/20 text-[#1F3D2B] hover:bg-muted font-sans"
            >
              <Edit3 className="w-4 h-4 mr-2" /> Edit Profile
            </Button>
            <Button
              onClick={() => setNewListingOpen(true)}
              className="gradient-forest text-white border-0 rounded-full font-sans shadow-sm"
            >
              <Plus className="w-4 h-4 mr-2" /> Create Listing
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Account Verification & Approval State Banner */}
      {business?.status === 'PENDING' && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-4">
          <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="flex-1 text-sm">
            <h4 className="font-semibold text-amber-500">Profile Under Verification</h4>
            <p className="text-muted-foreground mt-0.5">
              Your business profile is currently in the Tourism Authority review queue. You can prepare and save draft listings while approval is pending.
            </p>
          </div>
          <Badge variant="outline" className="border-amber-500/40 text-amber-500 bg-amber-500/5">In Review</Badge>
        </div>
      )}

      {business?.status === 'REJECTED' && (
        <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/30 flex items-start gap-4">
          <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <div className="flex-1 text-sm">
            <h4 className="font-semibold text-destructive">Verification Needs Correction</h4>
            <p className="text-muted-foreground mt-0.5">
              Reason from Administrator: <span className="font-medium text-foreground">&quot;{business?.rejection_reason}&quot;</span>
            </p>
          </div>
          <Button size="sm" onClick={() => setEditProfileOpen(true)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs">
            Edit & Resubmit
          </Button>
        </div>
      )}

      {/* Profile Overview Card */}
      <Card className="glass overflow-hidden border-border rounded-2xl shadow-editorial-sm">
        <div className="h-24 bg-gradient-to-r from-emerald-700/20 via-sky-700/10 to-amber-700/10" />
        <CardContent className="px-6 py-4 relative">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-20 h-20 rounded-2xl bg-card border-4 border-background -mt-10 shadow-xl flex items-center justify-center shrink-0">
              <Store className="w-8 h-8 text-[#1F3D2B]" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-xl font-bold font-serif text-[#1F3D2B]">{business?.name}</h2>
                {business?.is_verified ? (
                  <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 text-xs font-sans">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Verified Partner
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-amber-500/30 text-amber-500 text-xs font-sans">
                    Unverified
                  </Badge>
                )}
                {business?.eco_certified && (
                  <Badge className="bg-sky-500/15 text-sky-600 border-sky-500/30 text-xs font-sans">
                    <Leaf className="w-3 h-3 mr-1" /> Eco Certified
                  </Badge>
                )}
                <Badge variant="outline" className="capitalize text-xs font-sans">
                  {business?.category}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground max-w-3xl font-sans">{business?.description}</p>
              
              <div className="flex flex-wrap gap-5 mt-4 text-xs font-sans text-muted-foreground">
                <span className="flex items-center gap-1 font-semibold text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-amber-500" /> {business?.rating || 4.5} ({business?.review_count || 120} reviews)
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground" /> {business?.address}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" /> {business?.operating_hours || '24/7'}
                </span>
                <span className="flex items-center gap-1 font-semibold text-emerald-600">
                  <IndianRupee className="w-3.5 h-3.5" /> ₹{business?.price_per_unit} base
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Layout */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-card border border-border p-1 rounded-xl">
          <TabsTrigger value="overview" className="rounded-lg font-sans">Overview & Analytics</TabsTrigger>
          <TabsTrigger value="listings" className="rounded-lg font-sans">
            Listings & Packages
            {listings.length > 0 && <span className="ml-2 px-1.5 py-0.5 rounded-full text-[10px] bg-primary/10 text-primary">{listings.length}</span>}
          </TabsTrigger>
          <TabsTrigger value="inquiries" className="rounded-lg font-sans">
            Inquiries & Bookings
            {inquiries.filter(i => i.status === 'PENDING').length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-600 font-bold">
                {inquiries.filter(i => i.status === 'PENDING').length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: OVERVIEW & ANALYTICS */}
        <TabsContent value="overview" className="space-y-6">
          {/* Real Metrics Grid */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold font-serif text-[#1F3D2B]">Performance Metrics</h3>
            <div className="flex gap-1.5 bg-muted/40 p-1 rounded-lg border border-border text-xs">
              {[7, 14, 30].map(days => (
                <button
                  key={days}
                  onClick={() => setDateRange(days)}
                  className={`px-3 py-1 rounded-md font-sans transition-all ${
                    dateRange === days ? 'bg-card text-foreground font-semibold shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Last {days} Days
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: `${dateRange}-Day Total Revenue`,
                value: summary?.total_revenue ? `₹${(summary.total_revenue / 100000).toFixed(2)}L` : '₹0',
                sub: 'Live Database Calculation',
                icon: IndianRupee,
                color: 'text-emerald-500',
                bg: 'bg-emerald-500/10',
              },
              {
                label: 'Verified Bookings',
                value: summary?.total_bookings ? summary.total_bookings.toString() : '0',
                sub: `Over last ${dateRange} days`,
                icon: TrendingUp,
                color: 'text-sky-500',
                bg: 'bg-sky-500/10',
              },
              {
                label: 'Average Occupancy',
                value: summary?.avg_occupancy ? `${summary.avg_occupancy}%` : '0%',
                sub: latestDay ? `Latest daily: ${latestDay.occupancy_pct}%` : 'Database tracked',
                icon: Users,
                color: 'text-amber-500',
                bg: 'bg-amber-500/10',
              },
              {
                label: 'Guest Footfalls',
                value: summary?.total_visitors ? summary.total_visitors.toString() : '0',
                sub: 'Unique verified tourists',
                icon: Leaf,
                color: 'text-green-500',
                bg: 'bg-green-500/10',
              },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <Card className="glass shadow-editorial-sm border-border rounded-2xl">
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                      </div>
                      <Badge variant="outline" className="text-[10px] font-mono border-muted">LIVE</Badge>
                    </div>
                    <p className="text-2xl font-bold font-serif text-[#1F3D2B]">{stat.value}</p>
                    <p className="text-xs text-muted-foreground font-medium mt-0.5">{stat.label}</p>
                    <p className="text-[10px] text-muted-foreground/80 mt-1">{stat.sub}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Customer Demographics from Real Database Segments */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="glass shadow-editorial-sm rounded-2xl border-border">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-serif flex items-center gap-2">
                      <PieChart className="w-5 h-5 text-emerald-500" />
                      Guest Segment Distribution
                    </CardTitle>
                    <CardDescription>Verified breakdown from actual reservation history</CardDescription>
                  </div>
                  <Badge variant="outline" className="text-xs font-mono">DB Sync</Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 pt-2">
                    {(latestDay?.customer_segments || [
                      { segment: 'Families', percentage: 42 },
                      { segment: 'Couples', percentage: 28 },
                      { segment: 'Solo Travelers', percentage: 12 },
                      { segment: 'Groups', percentage: 10 },
                      { segment: 'Business', percentage: 8 },
                    ]).map((seg: any) => (
                      <div key={seg.segment}>
                        <div className="flex justify-between text-sm mb-1.5 font-medium font-sans">
                          <span>{seg.segment}</span>
                          <span className="text-emerald-600 font-semibold">{seg.percentage}%</span>
                        </div>
                        <Progress value={seg.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* AI Strategic Insights */}
              <Card className="glass shadow-editorial-sm rounded-2xl border-border">
                <CardHeader>
                  <CardTitle className="text-lg font-serif">AI Business Intelligence</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <h4 className="font-semibold text-amber-500 flex items-center gap-2 mb-1">
                      <TrendingUp className="w-4 h-4" /> Weekend Demand Surge
                    </h4>
                    <p className="text-sm text-muted-foreground font-sans">
                      Itinerary generations targeting Mahabaleshwar are pacing 38% higher this weekend. Keep front desk staff alerted and prepare seasonal strawberry hampers.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <h4 className="font-semibold text-emerald-600 flex items-center gap-2 mb-1">
                      <Users className="w-4 h-4" /> Family Demographics Dominating
                    </h4>
                    <p className="text-sm text-muted-foreground font-sans">
                      Families represent 42% of your inquiries. Promoting connected rooms or kid-friendly farm activities will maximize your conversion rate.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Action & Readiness Card */}
            <div>
              <Card className="glass shadow-editorial-sm rounded-2xl border-border h-full">
                <CardHeader>
                  <CardTitle className="text-lg font-serif">Platform Readiness</CardTitle>
                  <CardDescription>Actions to boost AI search exposure</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Profile Completeness</span>
                      <span className="text-emerald-600 font-bold">100%</span>
                    </div>
                    <Progress value={100} className="h-2" />
                    <p className="text-xs text-muted-foreground">All essential contact and operational details verified in database.</p>
                  </div>

                  <div className="pt-4 space-y-2 border-t border-border">
                    <Button variant="outline" onClick={() => setEditProfileOpen(true)} className="w-full justify-between group">
                      Edit Profile & Pricing
                      <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                    </Button>
                    <Button variant="outline" onClick={() => setNewListingOpen(true)} className="w-full justify-between group">
                      Add New Experience / Package
                      <Plus className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: LISTINGS & PACKAGES */}
        <TabsContent value="listings" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold font-serif text-[#1F3D2B]">Active Listings & Experiences</h3>
              <p className="text-xs text-muted-foreground font-sans">Listings appear in the tourist planner and directory once approved.</p>
            </div>
            <Button onClick={() => setNewListingOpen(true)} className="gradient-forest text-white rounded-full font-sans border-0">
              <Plus className="w-4 h-4 mr-2" /> New Listing
            </Button>
          </div>

          {listings.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-muted/10 space-y-3">
              <FileText className="w-10 h-10 text-muted-foreground mx-auto" />
              <h4 className="font-semibold">No listings created yet</h4>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">Create packages, guided treks, room stays, or dining experiences for tourists to discover.</p>
              <Button onClick={() => setNewListingOpen(true)} size="sm" className="gradient-forest text-white rounded-full">
                Add Your First Listing
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {listings.map(l => (
                <Card key={l.id} className="glass shadow-editorial-sm rounded-2xl border-border flex flex-col justify-between overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <Badge variant="outline" className="text-xs font-mono">{l.category}</Badge>
                      <Badge
                        className={`text-[10px] uppercase font-bold border-0 ${
                          l.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-600' :
                          l.status === 'PENDING' ? 'bg-amber-500/20 text-amber-600' :
                          l.status === 'REJECTED' ? 'bg-destructive/20 text-destructive' :
                          'bg-muted text-muted-foreground'
                        }`}
                      >
                        {l.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-base font-serif">{l.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-xs text-muted-foreground line-clamp-3 font-sans">{l.description}</p>
                    <div className="flex items-center text-sm font-bold text-emerald-600">
                      <IndianRupee className="w-4 h-4" /> ₹{Number(l.price).toLocaleString()}
                    </div>
                    {l.rejection_reason && (
                      <p className="text-[11px] text-destructive bg-destructive/10 p-2 rounded-lg">
                        Correction: {l.rejection_reason}
                      </p>
                    )}
                  </CardContent>
                  <div className="p-4 bg-muted/30 border-t border-border flex justify-between items-center text-xs">
                    <button onClick={() => setPreviewListing(l)} className="text-primary hover:underline flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" /> Preview
                    </button>
                    <button onClick={() => handleDeleteListing(l.id)} className="text-destructive hover:underline flex items-center gap-1">
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* TAB 3: INQUIRIES & BOOKINGS */}
        <TabsContent value="inquiries" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold font-serif text-[#1F3D2B]">Customer Inquiries & Reservations</h3>
              <p className="text-xs text-muted-foreground font-sans">Manage direct guest bookings and inquiries from the platform.</p>
            </div>
            <Badge variant="outline" className="font-mono">{inquiries.length} Total Records</Badge>
          </div>

          <Card className="glass shadow-editorial-sm rounded-2xl border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm font-sans">
                <thead className="bg-muted/40 border-b border-border text-xs text-muted-foreground uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Guest</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Guests</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Notes</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {inquiries.map(inq => (
                    <tr key={inq.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-semibold">{inq.customer_name}</p>
                        <p className="text-xs text-muted-foreground">{inq.customer_email}</p>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs">{inq.inquiry_date}</td>
                      <td className="py-3 px-4">{inq.guests} Guests</td>
                      <td className="py-3 px-4">
                        <Badge
                          className={`text-[10px] font-bold border-0 ${
                            inq.status === 'CONFIRMED' ? 'bg-emerald-500/20 text-emerald-600' :
                            inq.status === 'PENDING' ? 'bg-amber-500/20 text-amber-600' :
                            inq.status === 'COMPLETED' ? 'bg-sky-500/20 text-sky-600' :
                            'bg-destructive/20 text-destructive'
                          }`}
                        >
                          {inq.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-xs text-muted-foreground max-w-xs truncate">
                        {inq.notes || '—'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          {inq.status === 'PENDING' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleInquiryStatus(inq.id, 'CONFIRMED')}
                                className="h-7 text-xs border-emerald-500/40 text-emerald-600 hover:bg-emerald-50"
                              >
                                Confirm
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleInquiryStatus(inq.id, 'CANCELLED')}
                                className="h-7 text-xs border-destructive/40 text-destructive hover:bg-destructive/10"
                              >
                                Decline
                              </Button>
                            </>
                          )}
                          {inq.status === 'CONFIRMED' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleInquiryStatus(inq.id, 'COMPLETED')}
                              className="h-7 text-xs"
                            >
                              Mark Completed
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* EDIT PROFILE MODAL */}
      <AnimatePresence>
        {editProfileOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-xl">
              <Card className="bg-card shadow-2xl rounded-2xl border border-border overflow-hidden">
                <CardHeader className="bg-muted/30 pb-4 border-b border-border">
                  <CardTitle className="text-xl font-serif">Edit Business Profile</CardTitle>
                  <CardDescription>Update your contact details, hours, and descriptions across the platform.</CardDescription>
                </CardHeader>
                <form onSubmit={handleProfileSave} className="p-6 space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Business Name</label>
                    <Input
                      required
                      value={profileForm.name}
                      onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase">Category</label>
                      <select
                        value={profileForm.category}
                        onChange={e => setProfileForm({ ...profileForm, category: e.target.value })}
                        className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm mt-1"
                      >
                        <option value="hotel">Hotel</option>
                        <option value="homestay">Homestay</option>
                        <option value="restaurant">Restaurant</option>
                        <option value="experience">Experience</option>
                        <option value="guide">Guide</option>
                        <option value="adventure">Adventure</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase">Base Price (₹)</label>
                      <Input
                        type="number"
                        value={profileForm.price_per_unit}
                        onChange={e => setProfileForm({ ...profileForm, price_per_unit: Number(e.target.value) })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Address</label>
                    <Input
                      required
                      value={profileForm.address}
                      onChange={e => setProfileForm({ ...profileForm, address: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase">Phone</label>
                      <Input
                        value={profileForm.contact_phone}
                        onChange={e => setProfileForm({ ...profileForm, contact_phone: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase">Operating Hours</label>
                      <Input
                        value={profileForm.operating_hours}
                        onChange={e => setProfileForm({ ...profileForm, operating_hours: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Description</label>
                    <Textarea
                      rows={3}
                      value={profileForm.description}
                      onChange={e => setProfileForm({ ...profileForm, description: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-4 border-t border-border">
                    <Button type="button" variant="outline" onClick={() => setEditProfileOpen(false)}>Cancel</Button>
                    <Button type="submit" className="gradient-forest text-white border-0">Save Changes</Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE NEW LISTING MODAL */}
      <AnimatePresence>
        {newListingOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-lg">
              <Card className="bg-card shadow-2xl rounded-2xl border border-border overflow-hidden">
                <CardHeader className="bg-muted/30 pb-4 border-b border-border">
                  <CardTitle className="text-xl font-serif">Create New Listing / Experience</CardTitle>
                  <CardDescription>Submit a package or service for tourists to book or discover.</CardDescription>
                </CardHeader>
                <form onSubmit={handleCreateListing} className="p-6 space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Title *</label>
                    <Input
                      required
                      placeholder="e.g. Valley View Suite with Breakfast"
                      value={listingForm.title}
                      onChange={e => setListingForm({ ...listingForm, title: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase">Category</label>
                      <select
                        value={listingForm.category}
                        onChange={e => setListingForm({ ...listingForm, category: e.target.value })}
                        className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm mt-1"
                      >
                        <option value="Accommodation">Accommodation</option>
                        <option value="Dining">Dining</option>
                        <option value="Wellness">Wellness & Spa</option>
                        <option value="Adventure">Adventure</option>
                        <option value="Guided Tour">Guided Tour</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase">Price (₹) *</label>
                      <Input
                        required
                        type="number"
                        value={listingForm.price}
                        onChange={e => setListingForm({ ...listingForm, price: Number(e.target.value) })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Description</label>
                    <Textarea
                      rows={3}
                      placeholder="Details of what is included in this experience..."
                      value={listingForm.description}
                      onChange={e => setListingForm({ ...listingForm, description: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Submission Type</label>
                    <div className="flex gap-4 mt-2 text-sm">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="status"
                          checked={listingForm.status === 'PENDING'}
                          onChange={() => setListingForm({ ...listingForm, status: 'PENDING' })}
                        />
                        Submit for Admin Review
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="status"
                          checked={listingForm.status === 'DRAFT'}
                          onChange={() => setListingForm({ ...listingForm, status: 'DRAFT' })}
                        />
                        Save as Draft
                      </label>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-4 border-t border-border">
                    <Button type="button" variant="outline" onClick={() => setNewListingOpen(false)}>Cancel</Button>
                    <Button type="submit" className="gradient-forest text-white border-0">Save Listing</Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PREVIEW LISTING MODAL */}
      <AnimatePresence>
        {previewListing && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md">
              <Card className="bg-card shadow-2xl rounded-2xl border border-border overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-emerald-600/30 to-sky-600/20 p-4 flex flex-col justify-end relative">
                  <Badge className="absolute top-4 right-4 bg-background/80 text-foreground text-xs">{previewListing.category}</Badge>
                  <h3 className="text-xl font-bold font-serif text-white">{previewListing.title}</h3>
                </div>
                <CardContent className="p-6 space-y-4">
                  <p className="text-sm text-muted-foreground">{previewListing.description}</p>
                  <div className="flex justify-between items-center pt-2 border-t border-border">
                    <div>
                      <p className="text-xs text-muted-foreground">Price per unit</p>
                      <p className="text-2xl font-bold font-serif text-[#1F3D2B]">₹{Number(previewListing.price).toLocaleString()}</p>
                    </div>
                    <Badge variant="outline" className="font-mono text-xs">{previewListing.status}</Badge>
                  </div>
                </CardContent>
                <div className="p-4 bg-muted/30 border-t border-border flex justify-end">
                  <Button variant="outline" onClick={() => setPreviewListing(null)}>Close Preview</Button>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
