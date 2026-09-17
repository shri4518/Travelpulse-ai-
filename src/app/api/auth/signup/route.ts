import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password, role } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const validRoles = ['TOURIST', 'BUSINESS', 'AUTHORITY'];
    const userRole = validRoles.includes(role) ? role : 'TOURIST';

    // If Supabase is configured, try it first
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey && supabaseUrl !== 'https://your-project.supabase.co') {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data, error } = await supabase.auth.signUp({ email, password });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      // Create profile
      if (data.user) {
        await supabase.from('profiles').insert({
          id: data.user.id,
          role: userRole,
          full_name: email.split('@')[0],
          onboarding_complete: false,
        });
      }

      return NextResponse.json({
        user: {
          id: data.user?.id,
          role: userRole,
          full_name: email.split('@')[0],
          onboarding_complete: false,
        },
      });
    }

    // Fallback: demo mode
    return NextResponse.json({ error: 'Supabase not configured. Using demo signup.' }, { status: 503 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
