import { NextResponse } from 'next/server';
import { execute, queryOne } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { email, password, role } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const validRoles = ['TOURIST', 'BUSINESS', 'AUTHORITY'];
    const userRole = validRoles.includes(role) ? role : 'TOURIST';

    // 1. If Supabase is configured, try Supabase first
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey && supabaseUrl !== 'https://your-project.supabase.co') {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data, error } = await supabase.auth.signUp({ email, password });

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 400 });
        }

        if (data.user) {
          await supabase.from('profiles').insert({
            id: data.user.id,
            role: userRole,
            full_name: email.split('@')[0],
            onboarding_complete: false,
          });

          return NextResponse.json({
            user: {
              id: data.user.id,
              role: userRole,
              full_name: email.split('@')[0],
              onboarding_complete: false,
            },
          });
        }
      } catch (sbErr) {
        console.warn('Supabase signup error, using local database:', sbErr);
      }
    }

    // 2. Local Database Signup
    const newUserId = `user-${Date.now()}`;
    const fullName = email.split('@')[0];

    execute(
      `INSERT INTO profiles (
        id, role, full_name, onboarding_complete, preferred_destinations,
        interests, food_preferences, created_at, updated_at
      ) VALUES (?, ?, ?, 0, '[]', '[]', '[]', datetime('now'), datetime('now'))`,
      [newUserId, userRole, fullName]
    );

    const created: any = queryOne(`SELECT * FROM profiles WHERE id = ?`, [newUserId]);
    const user = {
      ...created,
      onboarding_complete: false,
      preferred_destinations: [],
      interests: [],
      food_preferences: [],
    };

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
