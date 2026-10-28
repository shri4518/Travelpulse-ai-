import { NextResponse } from 'next/server';
import { queryOne, execute } from '@/lib/db';

export async function GET() {
  try {
    const summary = queryOne(`SELECT * FROM tourism_summaries WHERE id = 'current-overview'`);

    if (!summary) {
      return NextResponse.json(
        { success: false, error: 'Tourism summary not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        totalVisitorsThisMonth: summary.total_visitors_this_month,
        avgDailyVisitors: summary.avg_daily_visitors,
        avgSpend: summary.avg_spend,
        avgOccupancy: summary.avg_occupancy,
        totalRevenue: summary.total_revenue,
        avgSustainability: summary.avg_sustainability,
        updated_at: summary.updated_at,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch tourism summary' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const current = queryOne(`SELECT * FROM tourism_summaries WHERE id = 'current-overview'`);

    const updated = {
      totalVisitorsThisMonth: body.totalVisitorsThisMonth ?? current?.total_visitors_this_month ?? 0,
      avgDailyVisitors: body.avgDailyVisitors ?? current?.avg_daily_visitors ?? 0,
      avgSpend: body.avgSpend ?? current?.avg_spend ?? 0,
      avgOccupancy: body.avgOccupancy ?? current?.avg_occupancy ?? 0,
      totalRevenue: body.totalRevenue ?? current?.total_revenue ?? 0,
      avgSustainability: body.avgSustainability ?? current?.avg_sustainability ?? 0,
    };

    execute(
      `INSERT INTO tourism_summaries (
        id, total_visitors_this_month, avg_daily_visitors, avg_spend,
        avg_occupancy, total_revenue, avg_sustainability, updated_at
      ) VALUES ('current-overview', ?, ?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(id) DO UPDATE SET
        total_visitors_this_month = excluded.total_visitors_this_month,
        avg_daily_visitors = excluded.avg_daily_visitors,
        avg_spend = excluded.avg_spend,
        avg_occupancy = excluded.avg_occupancy,
        total_revenue = excluded.total_revenue,
        avg_sustainability = excluded.avg_sustainability,
        updated_at = excluded.updated_at`,
      [
        updated.totalVisitorsThisMonth,
        updated.avgDailyVisitors,
        updated.avgSpend,
        updated.avgOccupancy,
        updated.totalRevenue,
        updated.avgSustainability,
      ]
    );

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update tourism summary' },
      { status: 500 }
    );
  }
}
