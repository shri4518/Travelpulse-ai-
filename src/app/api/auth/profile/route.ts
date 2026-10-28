import { NextResponse } from 'next/server';
import { queryOne, execute } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Profile id is required' }, { status: 400 });
    }

    const row: any = queryOne(`SELECT * FROM profiles WHERE id = ?`, [id]);
    if (!row) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const profile = {
      ...row,
      onboarding_complete: Boolean(row.onboarding_complete),
      preferred_destinations: typeof row.preferred_destinations === 'string' ? JSON.parse(row.preferred_destinations) : row.preferred_destinations,
      interests: typeof row.interests === 'string' ? JSON.parse(row.interests) : row.interests,
      food_preferences: typeof row.food_preferences === 'string' ? JSON.parse(row.food_preferences) : row.food_preferences,
    };

    return NextResponse.json({ success: true, user: profile });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Profile id is required' }, { status: 400 });
    }

    const existing: any = queryOne(`SELECT * FROM profiles WHERE id = ?`, [id]);
    if (!existing) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const merged = {
      full_name: updates.full_name !== undefined ? updates.full_name : existing.full_name,
      avatar_url: updates.avatar_url !== undefined ? updates.avatar_url : existing.avatar_url,
      onboarding_complete: updates.onboarding_complete !== undefined ? (updates.onboarding_complete ? 1 : 0) : existing.onboarding_complete,
      age_range: updates.age_range !== undefined ? updates.age_range : existing.age_range,
      travel_group: updates.travel_group !== undefined ? updates.travel_group : existing.travel_group,
      budget_preference: updates.budget_preference !== undefined ? updates.budget_preference : existing.budget_preference,
      preferred_destinations: updates.preferred_destinations !== undefined ? JSON.stringify(updates.preferred_destinations) : existing.preferred_destinations,
      travel_style: updates.travel_style !== undefined ? updates.travel_style : existing.travel_style,
      interests: updates.interests !== undefined ? JSON.stringify(updates.interests) : existing.interests,
      food_preferences: updates.food_preferences !== undefined ? JSON.stringify(updates.food_preferences) : existing.food_preferences,
      adventure_preference: updates.adventure_preference !== undefined ? updates.adventure_preference : existing.adventure_preference,
      accommodation_preference: updates.accommodation_preference !== undefined ? updates.accommodation_preference : existing.accommodation_preference,
    };

    execute(
      `UPDATE profiles SET
        full_name = ?,
        avatar_url = ?,
        onboarding_complete = ?,
        age_range = ?,
        travel_group = ?,
        budget_preference = ?,
        preferred_destinations = ?,
        travel_style = ?,
        interests = ?,
        food_preferences = ?,
        adventure_preference = ?,
        accommodation_preference = ?,
        updated_at = datetime('now')
      WHERE id = ?`,
      [
        merged.full_name,
        merged.avatar_url,
        merged.onboarding_complete,
        merged.age_range,
        merged.travel_group,
        merged.budget_preference,
        merged.preferred_destinations,
        merged.travel_style,
        merged.interests,
        merged.food_preferences,
        merged.adventure_preference,
        merged.accommodation_preference,
        id,
      ]
    );

    const updatedRow: any = queryOne(`SELECT * FROM profiles WHERE id = ?`, [id]);
    return NextResponse.json({
      success: true,
      user: {
        ...updatedRow,
        onboarding_complete: Boolean(updatedRow.onboarding_complete),
        preferred_destinations: JSON.parse(updatedRow.preferred_destinations || '[]'),
        interests: JSON.parse(updatedRow.interests || '[]'),
        food_preferences: JSON.parse(updatedRow.food_preferences || '[]'),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
