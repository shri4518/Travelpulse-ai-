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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Compass, ArrowRight, AlertCircle } from 'lucide-react';
import { UserRole } from '@/lib/types';

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('TOURIST');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signup(email, password, role);
      if (role === 'TOURIST') {
        router.push('/onboarding');
      } else {
        router.push(role === 'BUSINESS' ? '/business/dashboard' : '/admin/tourism');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 gradient-hero opacity-30" />
      <div className="absolute top-20 right-10 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
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
            <CardTitle className="text-2xl">Create your account</CardTitle>
            <CardDescription>Join the intelligent tourism ecosystem</CardDescription>
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
                  minLength={6}
                />
              </div>

              <div className="space-y-3">
                <Label>I am a...</Label>
                <RadioGroup value={role} onValueChange={(v) => setRole(v as UserRole)} className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'TOURIST', label: '🧳 Tourist', desc: 'Plan & explore' },
                    { value: 'BUSINESS', label: '🏪 Business', desc: 'List & manage' },
                    { value: 'AUTHORITY', label: '🏛️ Authority', desc: 'Monitor & analyze' },
                  ].map(option => (
                    <Label
                      key={option.value}
                      htmlFor={option.value}
                      className={`flex flex-col items-center gap-1 rounded-xl border-2 p-3 cursor-pointer transition-all text-center ${
                        role === option.value
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'border-border hover:border-muted-foreground/30'
                      }`}
                    >
                      <RadioGroupItem value={option.value} id={option.value} className="sr-only" />
                      <span className="text-lg">{option.label.split(' ')[0]}</span>
                      <span className="text-xs font-medium">{option.label.split(' ')[1]}</span>
                      <span className="text-[10px] text-muted-foreground">{option.desc}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>

              <Button
                type="submit"
                className="w-full gradient-forest text-white border-0"
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Create account'}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Already have an account?{' '}
              <Link href="/login" className="text-emerald-400 hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>

        <div className="text-center mt-4">
          <Badge variant="outline" className="text-[10px]">
            Demo Mode — Accounts are stored locally
          </Badge>
        </div>
      </motion.div>
    </div>
  );
}
