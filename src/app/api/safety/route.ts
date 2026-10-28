import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const destinationId = searchParams.get('destination_id');
    const search = searchParams.get('search') || '';

    let sql = `SELECT * FROM safety_facilities WHERE 1=1`;
    const params: any[] = [];

    if (destinationId) {
      sql += ` AND destination_id = ?`;
      params.push(destinationId);
    }

    if (search.trim()) {
      sql += ` AND (name LIKE ? OR type LIKE ? OR address LIKE ?)`;
      params.push(`%${search.trim()}%`, `%${search.trim()}%`, `%${search.trim()}%`);
    }

    sql += ` ORDER BY name ASC`;

    const facilities = query(sql, params).map((f: any) => ({
      ...f,
      is_24hr: Boolean(f.is_24hr),
      emergency_services: typeof f.emergency_services === 'string' ? JSON.parse(f.emergency_services || '[]') : f.emergency_services,
    }));

    return NextResponse.json({
      success: true,
      count: facilities.length,
      facilities,
      disclaimer: 'Notice: Safety facilities and contact records in this system are demonstration fixtures and have not been independently verified for live emergency dispatch.'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch safety facilities' },
      { status: 500 }
    );
  }
}
