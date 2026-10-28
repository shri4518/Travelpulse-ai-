import { NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';

const EMAIL_TO_USER_ID: Record<string, string> = {
  'tourist@demo.com': 'demo-tourist-001',
  'business@demo.com': 'demo-business-001',
  'authority@demo.com': 'demo-authority-001',
  'admin@demo.com': 'demo-admin-001',
};

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // 1. If Supabase is configured, try it first
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey && supabaseUrl !== 'https://your-project.supabase.co') {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (!error && data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          return NextResponse.json({
            user: profile || { id: data.user.id, role: 'TOURIST', email },
          });
        }
      } catch (sbErr) {
        console.warn('Supabase login error, falling back to local database:', sbErr);
      }
    }

    // 2. Query Local Database for Profile
    const normalizedEmail = email.toLowerCase();
    const mappedId = EMAIL_TO_USER_ID[normalizedEmail];
    const profileId = mappedId || normalizedEmail;

    const row: any = queryOne(
      `SELECT * FROM profiles WHERE id = ? OR id = ? LIMIT 1`,
      [profileId, mappedId || '']
    );

    if (row) {
      const user = {
        ...row,
        onboarding_complete: Boolean(row.onboarding_complete),
        preferred_destinations: JSON.parse(row.preferred_destinations || '[]'),
        interests: JSON.parse(row.interests || '[]'),
        food_preferences: JSON.parse(row.food_preferences || '[]'),
      };
      return NextResponse.json({ success: true, user });
    }

    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
