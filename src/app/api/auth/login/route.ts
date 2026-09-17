import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // If Supabase is configured, try it first
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey && supabaseUrl !== 'https://your-project.supabase.co') {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 401 });
      }

      // Fetch profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user?.id)
        .single();

      return NextResponse.json({ user: profile || { id: data.user?.id, role: 'TOURIST', email } });
    }

    // Fallback: demo mode
    return NextResponse.json({ error: 'Supabase not configured. Use demo login.' }, { status: 503 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
