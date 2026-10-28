import { NextResponse } from 'next/server';
import { query, queryOne, execute } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const destinationId = searchParams.get('destination_id');

    if (destinationId) {
      const dest = queryOne(`SELECT * FROM destinations WHERE id = ?`, [destinationId]);
      if (!dest) {
        return NextResponse.json({ success: false, error: 'Destination not found' }, { status: 404 });
      }
      const attractions = query(`SELECT * FROM attractions WHERE destination_id = ?`, [destinationId]);
      return NextResponse.json({
        success: true,
        destination: {
          ...dest,
          categories: JSON.parse(dest.categories || '[]'),
          is_published: Boolean(dest.is_published),
        },
        attractions: attractions.map((a: any) => ({
          ...a,
          is_hidden_gem: Boolean(a.is_hidden_gem),
          is_published: Boolean(a.is_published),
        })),
      });
    }

    const destinations = query(`SELECT * FROM destinations ORDER BY name ASC`).map((d: any) => ({
      ...d,
      categories: JSON.parse(d.categories || '[]'),
      is_published: Boolean(d.is_published),
    }));

    return NextResponse.json({ success: true, destinations });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch destinations' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type = 'destination', admin_id } = body;

    if (type === 'destination') {
      const { name, state, country = 'India', latitude, longitude, description = '', categories = [], average_budget_per_day = 0, best_season = '' } = body;

      if (!name || !state || latitude === undefined || longitude === undefined) {
        return NextResponse.json(
          { success: false, error: 'Name, state, latitude, and longitude are required' },
          { status: 400 }
        );
      }

      const id = `dest-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      execute(
        `INSERT INTO destinations (
          id, name, state, country, latitude, longitude, description, categories, best_season, average_budget_per_day, is_published, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, datetime('now'))`,
        [id, name, state, country, latitude, longitude, description, JSON.stringify(categories), best_season, average_budget_per_day]
      );

      // Audit log
      execute(
        `INSERT INTO audit_logs (id, admin_id, admin_name, action, target_entity, target_id, details, created_at)
         VALUES (?, ?, ?, 'CREATE_DESTINATION', 'destinations', ?, ?, datetime('now'))`,
        [`log-${Date.now()}`, admin_id || 'admin', 'Administrator', id, `Created destination: ${name}`]
      );

      const created = queryOne(`SELECT * FROM destinations WHERE id = ?`, [id]);
      return NextResponse.json({ success: true, destination: created });
    } else {
      // Create attraction
      const { destination_id, name, type: attrType, description = '', latitude, longitude, entry_fee = 0, crowd_level = 'MEDIUM', is_hidden_gem = false } = body;

      if (!destination_id || !name || !attrType || latitude === undefined || longitude === undefined) {
        return NextResponse.json(
          { success: false, error: 'destination_id, name, type, latitude, and longitude are required' },
          { status: 400 }
        );
      }

      const id = `attr-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      execute(
        `INSERT INTO attractions (
          id, destination_id, name, type, description, latitude, longitude, entry_fee, crowd_level, is_hidden_gem, is_published, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, datetime('now'))`,
        [id, destination_id, name, attrType, description, latitude, longitude, entry_fee, crowd_level, is_hidden_gem ? 1 : 0]
      );

      const created = queryOne(`SELECT * FROM attractions WHERE id = ?`, [id]);
      return NextResponse.json({ success: true, attraction: created });
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create content' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, type = 'destination', is_published, description, average_budget_per_day, best_season, admin_id } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }

    if (type === 'destination') {
      const current: any = queryOne(`SELECT * FROM destinations WHERE id = ?`, [id]);
      if (!current) {
        return NextResponse.json({ success: false, error: 'Destination not found' }, { status: 404 });
      }

      const newPublished = is_published !== undefined ? (is_published ? 1 : 0) : current.is_published;
      const newDesc = description !== undefined ? description : current.description;
      const newBudget = average_budget_per_day !== undefined ? Number(average_budget_per_day) : current.average_budget_per_day;
      const newSeason = best_season !== undefined ? best_season : current.best_season;

      execute(
        `UPDATE destinations SET
          is_published = ?,
          description = ?,
          average_budget_per_day = ?,
          best_season = ?
        WHERE id = ?`,
        [newPublished, newDesc, newBudget, newSeason, id]
      );

      // Audit log
      execute(
        `INSERT INTO audit_logs (id, admin_id, admin_name, action, target_entity, target_id, details, created_at)
         VALUES (?, ?, ?, 'UPDATE_DESTINATION', 'destinations', ?, ?, datetime('now'))`,
        [`log-${Date.now()}`, admin_id || 'admin', 'Administrator', id, `Updated destination ${id}. Published: ${Boolean(newPublished)}`]
      );

      const updated = queryOne(`SELECT * FROM destinations WHERE id = ?`, [id]);
      return NextResponse.json({ success: true, destination: updated });
    } else {
      // Update attraction
      execute(`UPDATE attractions SET is_published = ? WHERE id = ?`, [is_published ? 1 : 0, id]);
      const updated = queryOne(`SELECT * FROM attractions WHERE id = ?`, [id]);
      return NextResponse.json({ success: true, attraction: updated });
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update destination content' },
      { status: 500 }
    );
  }
}
