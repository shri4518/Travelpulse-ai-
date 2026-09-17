'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Compass, ArrowRight, AlertCircle } from 'lucide-react';
import { ROLE_DASHBOARDS } from '@/lib/constants';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      // Get user from localStorage to determine redirect
      const stored = localStorage.getItem('travelpulse_user');
      if (stored) {
        const user = JSON.parse(stored);
        const dashboard = ROLE_DASHBOARDS[user.role] || '/dashboard';
        if (!user.onboarding_complete && user.role === 'TOURIST') {
          router.push('/onboarding');
        } else {
          router.push(dashboard);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('demo123');
    setError('');
    setLoading(true);
    try {
      await login(demoEmail, 'demo123');
      const stored = localStorage.getItem('travelpulse_user');
      if (stored) {
        const user = JSON.parse(stored);
        router.push(ROLE_DASHBOARDS[user.role] || '/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 gradient-hero opacity-30" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl gradient-forest flex items-center justify-center">
            <Compass className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold">
            Travel<span className="text-gradient-forest">Pulse</span>{' '}
            <span className="text-muted-foreground font-normal text-sm">AI</span>
          </span>
        </Link>

        <Card className="glass-strong">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>Sign in to your account to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full gradient-forest text-white border-0"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign in'}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-card px-2 text-muted-foreground">Quick Demo Login</span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => handleDemoLogin('tourist@demo.com')}
                  disabled={loading}
                >
                  🧳 Tourist
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => handleDemoLogin('business@demo.com')}
                  disabled={loading}
                >
                  🏪 Business
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => handleDemoLogin('authority@demo.com')}
                  disabled={loading}
                >
                  🏛️ Authority
                </Button>
              </div>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-emerald-400 hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </CardContent>
        </Card>

        <div className="text-center mt-4">
          <Badge variant="outline" className="text-[10px]">
            Demo Mode — No real authentication required
          </Badge>
        </div>
      </motion.div>
    </div>
  );
}
