import { NextResponse } from 'next/server';

export async function PATCH() {
  // In demo mode, profile updates are handled client-side
  // In production, this would update the Supabase profiles table
  return NextResponse.json({ success: true });
}
