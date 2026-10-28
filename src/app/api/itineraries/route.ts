import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const destination = searchParams.get('destination');
    const userId = searchParams.get('user_id');

    if (id) {
      const itin = queryOne(`SELECT * FROM itineraries WHERE id = ?`, [id]);
      if (!itin) {
        return NextResponse.json({ success: false, error: 'Itinerary not found' }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        itinerary: {
          ...itin,
          items: typeof itin.items === 'string' ? JSON.parse(itin.items || '[]') : itin.items,
          interests: typeof itin.interests === 'string' ? JSON.parse(itin.interests || '[]') : itin.interests,
          optimization_log: typeof itin.optimization_log === 'string' ? JSON.parse(itin.optimization_log || '[]') : itin.optimization_log,
        }
      });
    }

    let sql = `SELECT * FROM itineraries WHERE 1=1`;
    const params: any[] = [];

    if (destination) {
      sql += ` AND destination LIKE ?`;
      params.push(`%${destination}%`);
    }

    if (userId) {
      sql += ` AND user_id = ?`;
      params.push(userId);
    }

    sql += ` ORDER BY created_at DESC`;

    const itineraries = query(sql, params).map((itin: any) => ({
      ...itin,
      items: typeof itin.items === 'string' ? JSON.parse(itin.items || '[]') : itin.items,
      interests: typeof itin.interests === 'string' ? JSON.parse(itin.interests || '[]') : itin.interests,
      optimization_log: typeof itin.optimization_log === 'string' ? JSON.parse(itin.optimization_log || '[]') : itin.optimization_log,
    }));

    return NextResponse.json({
      success: true,
      count: itineraries.length,
      itineraries,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch itineraries' },
      { status: 500 }
    );
  }
}
