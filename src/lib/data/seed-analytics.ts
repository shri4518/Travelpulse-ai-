import { TourismAnalytics, BusinessAnalytics } from '@/lib/types';

// Generate 30 days of tourism analytics
function generateTourismAnalytics(): TourismAnalytics[] {
  const data: TourismAnalytics[] = [];
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const baseVisitors = isWeekend ? 8500 : 4200;
    const variance = Math.random() * 0.3 - 0.15; // ±15%

    data.push({
      id: `ta-${i}`,
      date: date.toISOString().split('T')[0],
      total_visitors: Math.round(baseVisitors * (1 + variance)),
      avg_spend: Math.round((isWeekend ? 2800 : 2200) * (1 + variance * 0.5)),
      hotel_occupancy_pct: Math.round((isWeekend ? 88 : 52) + variance * 10),
      local_biz_revenue: Math.round((isWeekend ? 1850000 : 920000) * (1 + variance)),
      sustainability_index: Math.round((72 + Math.random() * 15) * 10) / 10,
      top_attractions: [
        { name: 'Venna Lake', visitors: Math.round(2840 * (1 + variance)) },
        { name: 'Mapro Garden', visitors: Math.round(3200 * (1 + variance * 0.8)) },
        { name: 'Table Land', visitors: Math.round(2650 * (1 + variance * 0.7)) },
        { name: 'Bombay Point', visitors: Math.round(2100 * (1 + variance * 0.6)) },
        { name: "Arthur's Seat", visitors: Math.round(1580 * (1 + variance * 0.5)) },
      ],
      crowd_distribution: [
        { area: 'Venna Lake Area', level: 'HIGH', count: Math.round(2840 * (1 + variance)) },
        { area: 'Market Area', level: 'HIGH', count: Math.round(4200 * (1 + variance)) },
        { area: 'Wilson Point', level: 'MEDIUM', count: Math.round(1890 * (1 + variance)) },
        { area: 'Old Mahabaleshwar', level: 'MEDIUM', count: Math.round(1120 * (1 + variance)) },
        { area: 'Lingmala', level: 'LOW', count: Math.round(980 * (1 + variance)) },
        { area: 'Sidney Point', level: 'LOW', count: Math.round(280 * (1 + variance)) },
      ],
    });
  }
  return data;
}

// Generate business analytics for demo business
function generateBusinessAnalytics(): BusinessAnalytics[] {
  const data: BusinessAnalytics[] = [];
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const variance = Math.random() * 0.3 - 0.15;

    data.push({
      id: `ba-${i}`,
      business_id: 'biz-001', // Brightland Resort
      date: date.toISOString().split('T')[0],
      bookings: Math.round((isWeekend ? 18 : 8) * (1 + variance)),
      revenue: Math.round((isWeekend ? 153000 : 68000) * (1 + variance)),
      occupancy_pct: Math.round((isWeekend ? 92 : 55) + variance * 10),
      visitor_count: Math.round((isWeekend ? 45 : 20) * (1 + variance)),
      customer_segments: [
        { segment: 'Families', percentage: 42 },
        { segment: 'Couples', percentage: 28 },
        { segment: 'Solo Travelers', percentage: 12 },
        { segment: 'Groups', percentage: 10 },
        { segment: 'Business', percentage: 8 },
      ],
    });
  }
  return data;
}

export const seedTourismAnalytics = generateTourismAnalytics();
export const seedBusinessAnalytics = generateBusinessAnalytics();

// Pre-computed summary stats
export const tourismSummary = {
  totalVisitorsThisMonth: seedTourismAnalytics.reduce((sum, d) => sum + d.total_visitors, 0),
  avgDailyVisitors: Math.round(seedTourismAnalytics.reduce((sum, d) => sum + d.total_visitors, 0) / 30),
  avgSpend: Math.round(seedTourismAnalytics.reduce((sum, d) => sum + d.avg_spend, 0) / 30),
  avgOccupancy: Math.round(seedTourismAnalytics.reduce((sum, d) => sum + d.hotel_occupancy_pct, 0) / 30),
  totalRevenue: seedTourismAnalytics.reduce((sum, d) => sum + d.local_biz_revenue, 0),
  avgSustainability: Math.round(seedTourismAnalytics.reduce((sum, d) => sum + d.sustainability_index, 0) / 30 * 10) / 10,
};
