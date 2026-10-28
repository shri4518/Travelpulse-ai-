import { NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('business_id') || 'biz-001';
    const limit = parseInt(searchParams.get('limit') || '30', 10);

    const rows = query(
      `SELECT * FROM business_analytics WHERE business_id = ? ORDER BY date DESC LIMIT ?`,
      [businessId, limit]
    );

    const parsedRows = rows.map((r: any) => ({
      ...r,
      customer_segments: typeof r.customer_segments === 'string' ? JSON.parse(r.customer_segments) : r.customer_segments,
    }));

    // Aggregate statistics
    const stats = query(
      `SELECT 
        COUNT(*) as total_days,
        SUM(bookings) as total_bookings,
        SUM(revenue) as total_revenue,
        AVG(occupancy_pct) as avg_occupancy,
        SUM(visitor_count) as total_visitors
       FROM business_analytics 
       WHERE business_id = ?`,
      [businessId]
    )[0] || {};

    return NextResponse.json({
      success: true,
      business_id: businessId,
      data: parsedRows,
      summary: {
        total_days: stats.total_days || 0,
        total_bookings: stats.total_bookings || 0,
        total_revenue: stats.total_revenue || 0,
        avg_occupancy: Math.round(stats.avg_occupancy || 0),
        total_visitors: stats.total_visitors || 0,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch business analytics' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      business_id,
      date,
      bookings = 0,
      revenue = 0,
      occupancy_pct = 0,
      visitor_count = 0,
      customer_segments = [],
    } = body;

    if (!business_id || !date) {
      return NextResponse.json(
        { success: false, error: 'business_id and date are required' },
        { status: 400 }
      );
    }

    const metricId = id || `ba-${Date.now()}`;
    const segmentsJson = JSON.stringify(customer_segments);

    execute(
      `INSERT INTO business_analytics (
        id, business_id, date, bookings, revenue, occupancy_pct, visitor_count, customer_segments
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        business_id = excluded.business_id,
        date = excluded.date,
        bookings = excluded.bookings,
        revenue = excluded.revenue,
        occupancy_pct = excluded.occupancy_pct,
        visitor_count = excluded.visitor_count,
        customer_segments = excluded.customer_segments`,
      [metricId, business_id, date, bookings, revenue, occupancy_pct, visitor_count, segmentsJson]
    );

    return NextResponse.json({ success: true, id: metricId });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save business metric' },
      { status: 500 }
    );
  }
}
