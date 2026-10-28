import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const category = searchParams.get('category');
    const search = searchParams.get('search') || '';

    if (id) {
      const dest = queryOne(`SELECT * FROM destinations WHERE id = ?`, [id]);
      if (!dest) {
        return NextResponse.json({ success: false, error: 'Destination not found' }, { status: 404 });
      }
      const attractions = query(`SELECT * FROM attractions WHERE destination_id = ?`, [id]);
      const businesses = query(`SELECT * FROM businesses WHERE destination_id = ? AND status = 'APPROVED'`, [id]);
      const safety = query(`SELECT * FROM safety_facilities WHERE destination_id = ?`, [id]);

      return NextResponse.json({
        success: true,
        destination: {
          ...dest,
          categories: typeof dest.categories === 'string' ? JSON.parse(dest.categories || '[]') : dest.categories,
          is_published: Boolean(dest.is_published),
        },
        attractions: attractions.map((a: any) => ({
          ...a,
          is_hidden_gem: Boolean(a.is_hidden_gem),
          is_published: Boolean(a.is_published),
          tags: typeof a.tags === 'string' ? JSON.parse(a.tags || '[]') : a.tags,
        })),
        businesses: businesses.map((b: any) => ({
          ...b,
          is_local: Boolean(b.is_local),
          is_verified: Boolean(b.is_verified),
          eco_certified: Boolean(b.eco_certified),
          amenities: typeof b.amenities === 'string' ? JSON.parse(b.amenities || '[]') : b.amenities,
        })),
        safety_facilities: safety.map((s: any) => ({
          ...s,
          is_24hr: Boolean(s.is_24hr),
        })),
      });
    }

    let sql = `SELECT * FROM destinations WHERE 1=1`;
    const params: any[] = [];

    if (search.trim()) {
      sql += ` AND (name LIKE ? OR state LIKE ? OR description LIKE ?)`;
      params.push(`%${search.trim()}%`, `%${search.trim()}%`, `%${search.trim()}%`);
    }

    sql += ` ORDER BY name ASC`;

    let destinations = query(sql, params).map((d: any) => ({
      ...d,
      categories: typeof d.categories === 'string' ? JSON.parse(d.categories || '[]') : d.categories,
      is_published: Boolean(d.is_published),
    }));

    if (category && category !== 'all') {
      destinations = destinations.filter((d: any) =>
        Array.isArray(d.categories) && d.categories.some((c: string) => c.toLowerCase() === category.toLowerCase())
      );
    }

    return NextResponse.json({
      success: true,
      count: destinations.length,
      destinations,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch destinations' },
      { status: 500 }
    );
  }
}
