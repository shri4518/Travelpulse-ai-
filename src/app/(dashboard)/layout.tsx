'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { SimulationPanel } from '@/components/simulation/SimulationPanel';
import {
  Compass,
  LayoutDashboard,
  Route,
  Store,
  Map,
  Heart,
  Shield,
  LogOut,
  ChevronLeft,
  Menu,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { TOURIST_NAV, BUSINESS_NAV, AUTHORITY_NAV } from '@/lib/constants';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Route,
  Store,
  Map,
  Heart,
  Shield,
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = user?.role === 'BUSINESS' ? BUSINESS_NAV : user?.role === 'AUTHORITY' || user?.role === 'ADMIN' ? AUTHORITY_NAV : TOURIST_NAV;

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-border bg-card/80 backdrop-blur-xl transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-60'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-4 h-16 border-b border-border shrink-0">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-forest flex items-center justify-center shrink-0">
              <Compass className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <span className="text-sm font-bold whitespace-nowrap">
                Travel<span className="text-gradient-forest">Pulse</span>
              </span>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto hidden lg:block p-1 rounded hover:bg-muted transition-colors"
          >
            <ChevronLeft className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const Icon = iconMap[item.icon] || LayoutDashboard;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User / Logout */}
        <div className="p-3 border-t border-border shrink-0">
          {user && !collapsed && (
            <div className="px-3 py-2 mb-2">
              <p className="text-sm font-medium truncate">{user.full_name || 'User'}</p>
              <p className="text-xs text-muted-foreground capitalize">{user.role.toLowerCase()}</p>
            </div>
          )}
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all w-full"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Log out</span>}
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main content */}
      <main className={`flex-1 transition-all duration-300 ${collapsed ? 'lg:ml-16' : 'lg:ml-60'}`}>
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center gap-3 px-4 h-14 border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-20">
          <Button variant="ghost" size="sm" onClick={() => setMobileOpen(true)}>
            <Menu className="w-5 h-5" />
          </Button>
          <span className="text-sm font-bold">
            Travel<span className="text-gradient-forest">Pulse</span>
          </span>
        </div>

        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>

      {/* Simulation Panel */}
      <SimulationPanel />
    </div>
  );
}
