'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { ROLE_DASHBOARDS } from '@/lib/constants';
import {
  Compass,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  User,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function Navbar() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const dashboardHref = user ? ROLE_DASHBOARDS[user.role] || '/dashboard' : '/dashboard';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FAF7F2]/80 backdrop-blur-xl border-b border-[#1F3D2B]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-full bg-[#1F3D2B] flex items-center justify-center group-hover:bg-[#0E4D4A] transition-colors">
              <Compass className="w-5 h-5 text-[#FAF7F2]" />
            </div>
            <span className="text-xl font-semibold tracking-tight font-serif text-[#1F3D2B]">
              TravelPulse <span className="text-[#E27D4F] font-sans text-sm font-bold">AI</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/trip-planner"
              className="text-[15px] font-medium text-[#6B6B6B] hover:text-[#E27D4F] transition-colors font-sans"
            >
              Plan Trip
            </Link>
            <Link
              href="/businesses"
              className="text-[15px] font-medium text-[#6B6B6B] hover:text-[#E27D4F] transition-colors font-sans"
            >
              Discover
            </Link>
            <Link
              href="/map"
              className="text-[15px] font-medium text-[#6B6B6B] hover:text-[#E27D4F] transition-colors font-sans"
            >
              Map
            </Link>
            <Link
              href="/impact"
              className="text-[15px] font-medium text-[#6B6B6B] hover:text-[#E27D4F] transition-colors font-sans"
            >
              Impact
            </Link>
          </div>

          {/* Auth / User */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="relative h-10 w-10 rounded-full flex items-center justify-center border-2 border-transparent hover:border-[#E27D4F] transition-all outline-none">
                  <Avatar className="h-9 w-9 shadow-sm">
                    <AvatarFallback className="bg-[#1F3D2B] text-[#FAF7F2] text-sm font-semibold">
                      {user.full_name?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user.full_name || 'User'}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user.role.toLowerCase()}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <Link href={dashboardHref} className="w-full">
                    <DropdownMenuItem className="cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/onboarding" className="w-full">
                    <DropdownMenuItem className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-[#1F3D2B] hover:text-[#0E4D4A] hover:bg-[#1F3D2B]/5 font-sans font-medium">
                    Log in
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="bg-[#E27D4F] hover:bg-[#CB6639] text-white rounded-full font-sans font-semibold px-5">
                    Sign up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-strong border-t border-border"
          >
            <div className="px-4 py-4 space-y-3">
              <Link
                href="/trip-planner"
                className="block text-sm py-2 text-muted-foreground hover:text-foreground"
                onClick={() => setMobileOpen(false)}
              >
                Plan Trip
              </Link>
              <Link
                href="/businesses"
                className="block text-sm py-2 text-muted-foreground hover:text-foreground"
                onClick={() => setMobileOpen(false)}
              >
                Discover
              </Link>
              <Link
                href="/map"
                className="block text-sm py-2 text-muted-foreground hover:text-foreground"
                onClick={() => setMobileOpen(false)}
              >
                Map
              </Link>
              <Link
                href="/impact"
                className="block text-sm py-2 text-muted-foreground hover:text-foreground"
                onClick={() => setMobileOpen(false)}
              >
                Impact
              </Link>
              <div className="pt-3 border-t border-border flex gap-2">
                {user ? (
                  <>
                    <Link href={dashboardHref} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full" onClick={() => setMobileOpen(false)}>
                        Dashboard
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        logout();
                        setMobileOpen(false);
                      }}
                    >
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="flex-1">
                      <Button variant="outline" size="sm" className="w-full" onClick={() => setMobileOpen(false)}>
                        Log in
                      </Button>
                    </Link>
                    <Link href="/signup" className="flex-1">
                      <Button size="sm" className="w-full gradient-forest text-white border-0" onClick={() => setMobileOpen(false)}>
                        Sign up
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
