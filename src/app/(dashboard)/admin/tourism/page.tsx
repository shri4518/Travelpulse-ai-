'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/auth-context';
import { useDestination } from '@/context/destination-context';
import {
  Users,
  TrendingUp,
  AlertTriangle,
  Building,
  Map,
  Activity,
  Download,
  Settings,
  BarChart3,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  Search,
  Plus,
  Eye,
  Store,
  FileText,
  UserCheck,
  UserX,
  History,
  MapPin,
  IndianRupee,
  RefreshCw,
  Edit2,
  Trash2,
  Check,
  X,
} from 'lucide-react';

export default function AuthorityDashboard() {
  const { user } = useAuth();
  const { currentDestination, setCurrentDestination } = useDestination();

  // Active Tab
  const [activeTab, setActiveTab] = useState('overview');

  // Overview Data
  const [metrics, setMetrics] = useState<any>(null);
  const [destinations, setDestinations] = useState<any[]>([]);
  const [activeDest, setActiveDest] = useState<any>(null);
  const [attractions, setAttractions] = useState<any[]>([]);

  // User Management State
  const [users, setUsers] = useState<any[]>([]);
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [userSearch, setUserSearch] = useState('');

  // Business Approvals Queue State
  const [businessQueue, setBusinessQueue] = useState<any[]>([]);
  const [businessCounts, setBusinessCounts] = useState<any>({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [bizStatusFilter, setBizStatusFilter] = useState('PENDING');
  const [bizSearch, setBizSearch] = useState('');
  const [reviewBiz, setReviewBiz] = useState<any>(null);
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Destination Management Modal
  const [newDestModalOpen, setNewDestModalOpen] = useState(false);
  const [newDestForm, setNewDestForm] = useState({
    name: '',
    state: '',
    latitude: 17.92,
    longitude: 73.65,
    description: '',
    best_season: 'October to June',
    average_budget_per_day: 3500,
  });

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Loading state
  const [loading, setLoading] = useState(true);

  // 1. Load Overview Metrics
  const loadOverviewData = useCallback(async () => {
    try {
      const res = await fetch('/api/analytics/tourism');
      if (res.ok) {
        const json = await res.json();
        setMetrics(json.data);
      }

      const destRes = await fetch('/api/admin/destinations');
      if (destRes.ok) {
        const dJson = await destRes.json();
        setDestinations(dJson.destinations || []);
        if (dJson.destinations?.length > 0 && !activeDest) {
          setActiveDest(dJson.destinations[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load overview data:', err);
    }
  }, [activeDest]);

  // 2. Load Business Approval Queue
  const loadBusinessQueue = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/businesses?status=${bizStatusFilter}&search=${encodeURIComponent(bizSearch)}`);
      if (res.ok) {
        const json = await res.json();
        setBusinessQueue(json.businesses || []);
        setBusinessCounts(json.counts || { total: 0, pending: 0, approved: 0, rejected: 0 });
      }
    } catch (err) {
      console.error('Failed to load business queue:', err);
    }
  }, [bizStatusFilter, bizSearch]);

  // 3. Load Users
  const loadUsers = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/users?role=${userRoleFilter}&search=${encodeURIComponent(userSearch)}`);
      if (res.ok) {
        const json = await res.json();
        setUsers(json.users || []);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  }, [userRoleFilter, userSearch]);

  // 4. Load Audit Logs
  const loadAuditLogs = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/audit-logs');
      if (res.ok) {
        const json = await res.json();
        setAuditLogs(json.logs || []);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    }
  }, []);

  // Initial Load
  useEffect(() => {
    setLoading(true);
    Promise.all([loadOverviewData(), loadBusinessQueue(), loadUsers(), loadAuditLogs()])
      .finally(() => setLoading(false));
  }, [loadOverviewData, loadBusinessQueue, loadUsers, loadAuditLogs]);

  // Handle Business Decision (Approve / Reject)
  async function handleBusinessDecision(id: string, action: 'APPROVE' | 'REJECT') {
    if (action === 'REJECT' && !rejectionReason.trim()) {
      alert('Please enter a rejection reason.');
      return;
    }

    try {
      const res = await fetch('/api/admin/businesses', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          action,
          rejection_reason: action === 'REJECT' ? rejectionReason : null,
          admin_id: user?.id || 'demo-admin-001',
          admin_name: user?.full_name || 'Administrator',
        }),
      });

      if (res.ok) {
        setRejectionModalOpen(false);
        setRejectionReason('');
        setReviewBiz(null);
        loadBusinessQueue();
        loadAuditLogs();
      }
    } catch (err) {
      console.error('Error recording decision:', err);
    }
  }

  // Handle User Status Toggle (Suspend / Reactivate)
  async function handleToggleUserStatus(u: any) {
    if (u.id === user?.id && u.is_active) {
      alert('Safety rule: You cannot suspend your own administrative account.');
      return;
    }

    const actionText = u.is_active ? 'suspend' : 'reactivate';
    if (!confirm(`Are you sure you want to ${actionText} ${u.full_name}?`)) return;

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: u.id,
          is_active: !u.is_active,
          admin_id: user?.id,
        }),
      });

      if (res.ok) {
        loadUsers();
        loadAuditLogs();
      }
    } catch (err) {
      console.error('Error toggling user status:', err);
    }
  }

  // Handle Add Destination
  async function handleAddDestination(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/destinations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'destination',
          ...newDestForm,
          admin_id: user?.id,
        }),
      });
      if (res.ok) {
        setNewDestModalOpen(false);
        loadOverviewData();
        loadAuditLogs();
      }
    } catch (err) {
      console.error('Error creating destination:', err);
    }
  }

  // Handle CSV Export
  function exportCSV(type: 'users' | 'businesses' | 'audit') {
    let headers = '';
    let rows = '';

    if (type === 'users') {
      headers = 'ID,Full Name,Role,Active,Onboarding Complete,Created At\n';
      rows = users.map(u => `"${u.id}","${u.full_name}","${u.role}",${u.is_active},${u.onboarding_complete},"${u.created_at}"`).join('\n');
    } else if (type === 'businesses') {
      headers = 'ID,Name,Category,Status,Verified,Phone,Email,Created At\n';
      rows = businessQueue.map(b => `"${b.id}","${b.name}","${b.category}","${b.status}",${b.is_verified},"${b.contact_phone || ''}","${b.contact_email || ''}","${b.created_at}"`).join('\n');
    } else if (type === 'audit') {
      headers = 'ID,Admin Name,Action,Target Entity,Target ID,Details,Created At\n';
      rows = auditLogs.map(l => `"${l.id}","${l.admin_name}","${l.action}","${l.target_entity}","${l.target_id}","${l.details || ''}","${l.created_at}"`).join('\n');
    }

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `travelpulse-${type}-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2.5 font-serif text-[#1F3D2B]">
              <Building className="w-7 h-7 text-primary" />
              Tourism Authority Command Center
            </h1>
            <p className="text-sm text-[#6B6B6B] mt-1 font-sans">
              Platform administration, verification workflows, and destination intelligence
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <select
              className="h-10 rounded-full border border-border bg-card px-4 text-xs font-semibold shadow-sm focus:outline-none"
              value={activeDest?.id || ''}
              onChange={(e) => {
                const found = destinations.find(d => d.id === e.target.value);
                if (found) {
                  setActiveDest(found);
                  if (setCurrentDestination) setCurrentDestination(found);
                }
              }}
            >
              {destinations.map(d => (
                <option key={d.id} value={d.id}>{d.name}, {d.state}</option>
              ))}
            </select>
            <Button variant="outline" onClick={() => exportCSV('users')} className="h-10 rounded-full text-xs font-sans">
              <Download className="w-3.5 h-3.5 mr-1.5" /> Export Data
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Primary KPI Ribbon (Database-Backed) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Monthly Footfall',
            value: metrics ? Number(metrics.totalVisitorsThisMonth).toLocaleString() : '153,131',
            trend: `${metrics ? metrics.avgDailyVisitors : '5,104'}/day avg`,
            color: 'text-secondary',
            icon: Users,
          },
          {
            label: 'Local Econ Impact',
            value: metrics ? `₹${(metrics.totalRevenue / 10000000).toFixed(2)}Cr` : '₹3.35Cr',
            trend: `Avg spend: ₹${metrics ? metrics.avgSpend : '2,309'}`,
            color: 'text-primary',
            icon: TrendingUp,
          },
          {
            label: 'Pending Business Queue',
            value: businessCounts.pending.toString(),
            trend: `${businessCounts.total} registered total`,
            color: businessCounts.pending > 0 ? 'text-amber-500' : 'text-emerald-500',
            icon: Store,
          },
          {
            label: 'Active Users',
            value: users.length.toString(),
            trend: 'Role-based verified',
            color: 'text-accent',
            icon: UserCheck,
          },
        ].map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className="glass shadow-editorial-sm border-border rounded-2xl">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1">{kpi.label}</p>
                  <div className="flex items-end gap-2">
                    <p className={`text-2xl font-bold font-serif ${kpi.color}`}>{kpi.value}</p>
                    <span className="text-[11px] text-muted-foreground/80 mb-0.5">{kpi.trend}</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center">
                  <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-card border border-border p-1 rounded-xl">
          <TabsTrigger value="overview" className="rounded-lg font-sans">Intelligence Overview</TabsTrigger>
          <TabsTrigger value="approvals" className="rounded-lg font-sans">
            Business Approval Queue
            {businessCounts.pending > 0 && (
              <span className="ml-2 px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-600 font-bold">
                {businessCounts.pending}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="users" className="rounded-lg font-sans">User Management</TabsTrigger>
          <TabsTrigger value="destinations" className="rounded-lg font-sans">Destination Content</TabsTrigger>
          <TabsTrigger value="audit" className="rounded-lg font-sans">Audit Logs</TabsTrigger>
        </TabsList>

        {/* TAB 1: OVERVIEW & CROWD INTELLIGENCE */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Load Alerts */}
              <Card className="glass border-red-500/20 shadow-editorial-sm rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-serif flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    Live Crowd & Load Management Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 mt-1.5 shrink-0 animate-pulse" />
                    <div className="flex-1 text-sm font-sans">
                      <h4 className="font-semibold text-red-500">Venna Lake boating reaching critical threshold</h4>
                      <p className="text-muted-foreground mt-0.5 mb-3 text-xs">
                        Current footfall is 150% above historical average for this hour. Estimated boating wait times exceed 2 hours.
                      </p>
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white h-7 text-xs border-0 rounded-full">
                          Issue In-App Reroute Alert
                        </Button>
                        <Button size="sm" variant="outline" className="border-red-500/30 text-red-500 h-7 text-xs rounded-full">
                          Notify Local Police
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Verified Trend & Demographics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="glass shadow-editorial-sm rounded-2xl border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-serif">Footfall Trend (7-Day Curve)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[120px] w-full flex items-end gap-2 pt-4">
                      {[42, 45, 56, 54, 93, 93, 85].map((val, i) => (
                        <div key={i} className="flex-1 bg-sky-500/20 rounded-t-sm relative group">
                          <div
                            className="absolute bottom-0 left-0 right-0 bg-sky-500 rounded-t-sm transition-all duration-500"
                            style={{ height: `${val}%` }}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between text-[11px] text-muted-foreground mt-2 font-mono">
                      <span>Mon</span>
                      <span>Wed</span>
                      <span>Fri</span>
                      <span>Weekend Peak</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass shadow-editorial-sm rounded-2xl border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-serif">Visitor Segmentation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 pt-2">
                      {[
                        { label: 'Families', pct: 42, color: 'bg-emerald-500' },
                        { label: 'Couples', pct: 28, color: 'bg-sky-500' },
                        { label: 'Solo Travelers', pct: 12, color: 'bg-amber-500' },
                        { label: 'Groups / Friends', pct: 10, color: 'bg-violet-500' },
                      ].map(d => (
                        <div key={d.label}>
                          <div className="flex justify-between text-xs mb-1 font-sans">
                            <span>{d.label}</span>
                            <span className="font-semibold">{d.pct}%</span>
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

            {/* Strategic Policy Insights */}
            <div>
              <Card className="glass shadow-editorial-sm rounded-2xl border-border h-full">
                <CardHeader>
                  <CardTitle className="text-lg font-serif flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-sky-500" />
                    AI Policy Insights
                  </CardTitle>
                  <CardDescription>Sustainable growth recommendations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 rounded-xl bg-muted/30 border border-border">
                    <Badge className="bg-sky-500/20 text-sky-600 mb-1.5 border-0 text-[10px]">DIVERSION</Badge>
                    <h4 className="text-sm font-semibold mb-1">Promote "Heritage Walk"</h4>
                    <p className="text-xs text-muted-foreground">
                      Diverting 1,200 tourists daily from Venna Lake to Old Mahabaleshwar temples reduces vehicle emissions by 14%.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/30 border border-border">
                    <Badge className="bg-emerald-500/20 text-emerald-600 mb-1.5 border-0 text-[10px]">SUSTAINABILITY</Badge>
                    <h4 className="text-sm font-semibold mb-1">Incentivize Eco-Stays</h4>
                    <p className="text-xs text-muted-foreground">
                      Eco-certified partners show 22% higher guest satisfaction. Expand green audit subsidies to homestays.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: BUSINESS APPROVAL QUEUE */}
        <TabsContent value="approvals" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
            <div className="flex gap-2">
              {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map(st => (
                <Button
                  key={st}
                  size="sm"
                  variant={bizStatusFilter === st ? 'default' : 'outline'}
                  onClick={() => setBizStatusFilter(st)}
                  className={`rounded-full text-xs font-sans ${
                    bizStatusFilter === st ? 'gradient-forest text-white border-0' : ''
                  }`}
                >
                  {st} {st === 'PENDING' && businessCounts.pending > 0 && `(${businessCounts.pending})`}
                </Button>
              ))}
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search business or owner..."
                value={bizSearch}
                onChange={e => setBizSearch(e.target.value)}
                className="pl-9 h-9 rounded-full text-xs"
              />
            </div>
          </div>

          <Card className="glass shadow-editorial-sm rounded-2xl border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm font-sans">
                <thead className="bg-muted/40 border-b border-border text-xs text-muted-foreground uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Business</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Owner / Contact</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Submitted</th>
                    <th className="py-3 px-4 text-right">Review Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {businessQueue.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-muted-foreground">
                        No businesses found matching filter: <span className="font-semibold">{bizStatusFilter}</span>
                      </td>
                    </tr>
                  ) : (
                    businessQueue.map(b => (
                      <tr key={b.id} className="hover:bg-muted/20 transition-colors">
                        <td className="py-3 px-4">
                          <p className="font-semibold text-foreground">{b.name}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {b.address}
                          </p>
                        </td>
                        <td className="py-3 px-4 capitalize">
                          <Badge variant="outline" className="text-xs">{b.category}</Badge>
                        </td>
                        <td className="py-3 px-4 text-xs">
                          <p className="font-medium">{b.owner_name || 'Direct Submission'}</p>
                          <p className="text-muted-foreground">{b.contact_email || b.contact_phone || '—'}</p>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            className={`text-[10px] font-bold border-0 ${
                              b.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-600' :
                              b.status === 'PENDING' ? 'bg-amber-500/20 text-amber-600' :
                              'bg-destructive/20 text-destructive'
                            }`}
                          >
                            {b.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-xs font-mono text-muted-foreground">
                          {b.submitted_at?.split('T')[0] || b.created_at?.split('T')[0]}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setReviewBiz(b)}
                              className="h-7 text-xs rounded-lg"
                            >
                              <Eye className="w-3 h-3 mr-1" /> Inspect
                            </Button>
                            {b.status === 'PENDING' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleBusinessDecision(b.id, 'APPROVE')}
                                  className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white border-0 rounded-lg"
                                >
                                  <Check className="w-3 h-3 mr-1" /> Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => {
                                    setReviewBiz(b);
                                    setRejectionModalOpen(true);
                                  }}
                                  className="h-7 text-xs rounded-lg"
                                >
                                  <X className="w-3 h-3 mr-1" /> Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* TAB 3: USER MANAGEMENT */}
        <TabsContent value="users" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
            <div className="flex gap-2">
              {['ALL', 'TOURIST', 'BUSINESS', 'AUTHORITY', 'ADMIN'].map(r => (
                <Button
                  key={r}
                  size="sm"
                  variant={userRoleFilter === r ? 'default' : 'outline'}
                  onClick={() => setUserRoleFilter(r)}
                  className={`rounded-full text-xs font-sans ${
                    userRoleFilter === r ? 'gradient-forest text-white border-0' : ''
                  }`}
                >
                  {r}
                </Button>
              ))}
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or ID..."
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                className="pl-9 h-9 rounded-full text-xs"
              />
            </div>
          </div>

          <Card className="glass shadow-editorial-sm rounded-2xl border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm font-sans">
                <thead className="bg-muted/40 border-b border-border text-xs text-muted-foreground uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Account Status</th>
                    <th className="py-3 px-4">Preferences</th>
                    <th className="py-3 px-4">Member Since</th>
                    <th className="py-3 px-4 text-right">Account Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-semibold">{u.full_name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{u.id}</p>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant="outline"
                          className={`text-xs font-mono font-bold ${
                            u.role === 'ADMIN' ? 'border-primary text-primary' :
                            u.role === 'AUTHORITY' ? 'border-sky-500 text-sky-500' :
                            u.role === 'BUSINESS' ? 'border-amber-500 text-amber-500' :
                            'border-muted text-muted-foreground'
                          }`}
                        >
                          {u.role}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        {u.is_active ? (
                          <Badge className="bg-emerald-500/15 text-emerald-600 border-0 text-[10px]">Active</Badge>
                        ) : (
                          <Badge variant="destructive" className="text-[10px]">Suspended</Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">
                        {u.travel_style || u.budget_preference || '—'}
                      </td>
                      <td className="py-3 px-4 text-xs font-mono text-muted-foreground">
                        {u.created_at?.split('T')[0]}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          size="sm"
                          variant={u.is_active ? 'outline' : 'default'}
                          onClick={() => handleToggleUserStatus(u)}
                          className={`h-7 text-xs rounded-lg ${
                            u.is_active ? 'border-destructive/30 text-destructive hover:bg-destructive/10' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          }`}
                        >
                          {u.is_active ? (
                            <>
                              <UserX className="w-3.5 h-3.5 mr-1" /> Suspend
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-3.5 h-3.5 mr-1" /> Reactivate
                            </>
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* TAB 4: DESTINATIONS & CONTENT MANAGEMENT */}
        <TabsContent value="destinations" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold font-serif text-[#1F3D2B]">Destination & Tourism Content</h3>
              <p className="text-xs text-muted-foreground font-sans">Manage live destinations and attractions across India.</p>
            </div>
            <Button onClick={() => setNewDestModalOpen(true)} className="gradient-forest text-white rounded-full font-sans border-0">
              <Plus className="w-4 h-4 mr-2" /> Add Destination
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {destinations.map(d => (
              <Card key={d.id} className="glass shadow-editorial-sm rounded-2xl border-border overflow-hidden flex flex-col justify-between">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <Badge variant="outline" className="text-xs font-mono">{d.state}</Badge>
                    <Badge className={d.is_published ? 'bg-emerald-500/20 text-emerald-600' : 'bg-muted text-muted-foreground'}>
                      {d.is_published ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl font-serif">{d.name}</CardTitle>
                  <CardDescription className="line-clamp-2 text-xs">{d.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-xs font-sans text-muted-foreground">
                  <p><span className="font-semibold text-foreground">Best Season:</span> {d.best_season || 'All year'}</p>
                  <p><span className="font-semibold text-foreground">Avg Daily Spend:</span> ₹{d.average_budget_per_day}</p>
                </CardContent>
                <div className="p-4 bg-muted/20 border-t border-border flex justify-between items-center text-xs">
                  <span className="font-mono text-[10px] text-muted-foreground">{d.latitude?.toFixed(2)}°, {d.longitude?.toFixed(2)}°</span>
                  <Badge variant="outline" className="text-[10px]">Verified Geo</Badge>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* TAB 5: AUDIT LOGS */}
        <TabsContent value="audit" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold font-serif text-[#1F3D2B]">Immutable Administrative Audit Trail</h3>
              <p className="text-xs text-muted-foreground font-sans">Full accountability record of all approvals, rejections, and role changes.</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => exportCSV('audit')} className="rounded-full text-xs">
              <Download className="w-3.5 h-3.5 mr-1" /> Export Audit Log
            </Button>
          </div>

          <Card className="glass shadow-editorial-sm rounded-2xl border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm font-sans">
                <thead className="bg-muted/40 border-b border-border text-xs text-muted-foreground uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Admin</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Target Entity</th>
                    <th className="py-3 px-4">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {auditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4 font-mono text-xs text-muted-foreground">
                        {log.created_at?.replace('T', ' ').substring(0, 19)}
                      </td>
                      <td className="py-3 px-4 font-semibold text-xs">{log.admin_name}</td>
                      <td className="py-3 px-4">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-mono font-bold ${
                            log.action.includes('APPROVE') ? 'border-emerald-500 text-emerald-600' :
                            log.action.includes('REJECT') ? 'border-destructive text-destructive' :
                            'border-sky-500 text-sky-500'
                          }`}
                        >
                          {log.action}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-xs font-mono text-muted-foreground">
                        {log.target_entity} / {log.target_id}
                      </td>
                      <td className="py-3 px-4 text-xs max-w-md truncate">
                        {log.details || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* INSPECT BUSINESS MODAL */}
      <AnimatePresence>
        {reviewBiz && !rejectionModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-lg">
              <Card className="bg-card shadow-2xl rounded-2xl border border-border overflow-hidden">
                <CardHeader className="bg-muted/30 pb-4 border-b border-border">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl font-serif">{reviewBiz.name}</CardTitle>
                      <CardDescription className="capitalize">{reviewBiz.category} • {reviewBiz.address}</CardDescription>
                    </div>
                    <Badge variant="outline">{reviewBiz.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4 text-sm font-sans">
                  <div>
                    <h5 className="font-semibold text-xs text-muted-foreground uppercase">Description</h5>
                    <p className="mt-1 text-muted-foreground">{reviewBiz.description || 'No description provided.'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-semibold text-xs text-muted-foreground uppercase">Contact</h5>
                      <p className="mt-1">{reviewBiz.contact_phone || '—'}</p>
                      <p className="text-xs text-muted-foreground">{reviewBiz.contact_email || '—'}</p>
                    </div>
                    <div>
                      <h5 className="font-semibold text-xs text-muted-foreground uppercase">Operating Hours</h5>
                      <p className="mt-1">{reviewBiz.operating_hours || '24/7'}</p>
                    </div>
                  </div>
                  {reviewBiz.amenities?.length > 0 && (
                    <div>
                      <h5 className="font-semibold text-xs text-muted-foreground uppercase mb-2">Amenities</h5>
                      <div className="flex flex-wrap gap-1.5">
                        {reviewBiz.amenities.map((am: string) => (
                          <Badge key={am} variant="secondary" className="text-xs font-normal">{am}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
                <div className="p-4 bg-muted/30 border-t border-border flex justify-between items-center">
                  <Button variant="outline" onClick={() => setReviewBiz(null)}>Close</Button>
                  {reviewBiz.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <Button variant="destructive" onClick={() => setRejectionModalOpen(true)}>
                        <X className="w-4 h-4 mr-1" /> Reject
                      </Button>
                      <Button onClick={() => handleBusinessDecision(reviewBiz.id, 'APPROVE')} className="gradient-forest text-white border-0">
                        <Check className="w-4 h-4 mr-1" /> Approve Business
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* REJECTION REASON MODAL */}
      <AnimatePresence>
        {rejectionModalOpen && reviewBiz && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md">
              <Card className="bg-card shadow-2xl rounded-2xl border border-destructive/30 overflow-hidden">
                <CardHeader className="bg-destructive/10 pb-4 border-b border-destructive/20">
                  <CardTitle className="text-lg font-serif text-destructive">Reject Business Submission</CardTitle>
                  <CardDescription>
                    Provide an explicit reason. This explanation will be displayed to the business owner so they can correct their listing.
                  </CardDescription>
                </CardHeader>
                <div className="p-6 space-y-4">
                  <p className="text-sm font-semibold">{reviewBiz.name}</p>
                  <Textarea
                    rows={4}
                    placeholder="e.g. Please provide a valid commercial food safety license and tax certificate..."
                    value={rejectionReason}
                    onChange={e => setRejectionReason(e.target.value)}
                  />
                  <div className="flex justify-end gap-3 pt-2">
                    <Button variant="outline" onClick={() => setRejectionModalOpen(false)}>Cancel</Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleBusinessDecision(reviewBiz.id, 'REJECT')}
                      disabled={!rejectionReason.trim()}
                    >
                      Confirm Rejection
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADD DESTINATION MODAL */}
      <AnimatePresence>
        {newDestModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md">
              <Card className="bg-card shadow-2xl rounded-2xl border border-border overflow-hidden">
                <CardHeader className="bg-muted/30 pb-4 border-b border-border">
                  <CardTitle className="text-lg font-serif">Add New Tourism Destination</CardTitle>
                  <CardDescription>Register a new city or tourist hub into TravelPulse AI.</CardDescription>
                </CardHeader>
                <form onSubmit={handleAddDestination} className="p-6 space-y-4">
                  <div>
                    <label className="text-xs font-semibold uppercase text-muted-foreground">Destination Name *</label>
                    <Input
                      required
                      placeholder="e.g. Udaipur"
                      value={newDestForm.name}
                      onChange={e => setNewDestForm({ ...newDestForm, name: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold uppercase text-muted-foreground">State *</label>
                      <Input
                        required
                        placeholder="e.g. Rajasthan"
                        value={newDestForm.state}
                        onChange={e => setNewDestForm({ ...newDestForm, state: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase text-muted-foreground">Avg Budget / Day (₹)</label>
                      <Input
                        type="number"
                        value={newDestForm.average_budget_per_day}
                        onChange={e => setNewDestForm({ ...newDestForm, average_budget_per_day: Number(e.target.value) })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold uppercase text-muted-foreground">Latitude</label>
                      <Input
                        type="number"
                        step="0.0001"
                        value={newDestForm.latitude}
                        onChange={e => setNewDestForm({ ...newDestForm, latitude: parseFloat(e.target.value) })}
                        className="mt-1 font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase text-muted-foreground">Longitude</label>
                      <Input
                        type="number"
                        step="0.0001"
                        value={newDestForm.longitude}
                        onChange={e => setNewDestForm({ ...newDestForm, longitude: parseFloat(e.target.value) })}
                        className="mt-1 font-mono text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase text-muted-foreground">Description</label>
                    <Textarea
                      rows={3}
                      placeholder="Tourism highlights, landscape, and climate..."
                      value={newDestForm.description}
                      onChange={e => setNewDestForm({ ...newDestForm, description: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-3 border-t border-border">
                    <Button type="button" variant="outline" onClick={() => setNewDestModalOpen(false)}>Cancel</Button>
                    <Button type="submit" className="gradient-forest text-white border-0">Save Destination</Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
