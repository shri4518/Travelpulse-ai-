import { NextResponse } from 'next/server';
import { queryOne, execute } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get('owner_id');
    const businessId = searchParams.get('id');

    let row: any = null;
    if (ownerId) {
      row = queryOne(`SELECT * FROM businesses WHERE owner_id = ? LIMIT 1`, [ownerId]);
    } else if (businessId) {
      row = queryOne(`SELECT * FROM businesses WHERE id = ? LIMIT 1`, [businessId]);
    } else {
      // Default to first business if no param supplied (for backwards compatibility)
      row = queryOne(`SELECT * FROM businesses LIMIT 1`);
    }

    if (!row) {
      return NextResponse.json({ success: true, business: null });
    }

    const business = {
      ...row,
      is_local: Boolean(row.is_local),
      is_verified: Boolean(row.is_verified),
      eco_certified: Boolean(row.eco_certified),
      amenities: typeof row.amenities === 'string' ? JSON.parse(row.amenities || '[]') : row.amenities,
    };

    return NextResponse.json({ success: true, business });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch business profile' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, owner_id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Business ID is required' }, { status: 400 });
    }

    const current: any = queryOne(`SELECT * FROM businesses WHERE id = ?`, [id]);
    if (!current) {
      return NextResponse.json({ success: false, error: 'Business not found' }, { status: 404 });
    }

    // Ownership check: if owner_id is provided, verify it matches
    if (owner_id && current.owner_id && current.owner_id !== owner_id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: You do not own this business' },
        { status: 403 }
      );
    }

    const merged = {
      name: updates.name !== undefined ? updates.name : current.name,
      category: updates.category !== undefined ? updates.category : current.category,
      description: updates.description !== undefined ? updates.description : current.description,
      contact_phone: updates.contact_phone !== undefined ? updates.contact_phone : current.contact_phone,
      contact_email: updates.contact_email !== undefined ? updates.contact_email : current.contact_email,
      address: updates.address !== undefined ? updates.address : current.address,
      operating_hours: updates.operating_hours !== undefined ? updates.operating_hours : current.operating_hours,
      price_per_unit: updates.price_per_unit !== undefined ? Number(updates.price_per_unit) : current.price_per_unit,
      amenities: updates.amenities !== undefined ? JSON.stringify(updates.amenities) : current.amenities,
    };

    execute(
      `UPDATE businesses SET
        name = ?,
        category = ?,
        description = ?,
        contact_phone = ?,
        contact_email = ?,
        address = ?,
        operating_hours = ?,
        price_per_unit = ?,
        amenities = ?
      WHERE id = ?`,
      [
        merged.name,
        merged.category,
        merged.description,
        merged.contact_phone,
        merged.contact_email,
        merged.address,
        merged.operating_hours,
        merged.price_per_unit,
        merged.amenities,
        id,
      ]
    );

    const updated: any = queryOne(`SELECT * FROM businesses WHERE id = ?`, [id]);
    return NextResponse.json({
      success: true,
      business: {
        ...updated,
        is_local: Boolean(updated.is_local),
        is_verified: Boolean(updated.is_verified),
        eco_certified: Boolean(updated.eco_certified),
        amenities: JSON.parse(updated.amenities || '[]'),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update business profile' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      owner_id,
      name,
      category = 'hotel',
      description = '',
      address = '',
      contact_phone = '',
      contact_email = '',
      price_per_unit = 0,
      destination_id = 'dest-mahabaleshwar',
      amenities = [],
      operating_hours = '9:00 AM - 9:00 PM',
    } = body;

    if (!owner_id || !name) {
      return NextResponse.json(
        { success: false, error: 'Business name and owner_id are required' },
        { status: 400 }
      );
    }

    const businessId = `biz-${Date.now()}`;
    const amenitiesJson = JSON.stringify(amenities);

    execute(
      `INSERT INTO businesses (
        id, destination_id, owner_id, name, category, description,
        price_per_unit, contact_phone, contact_email, address,
        amenities, operating_hours, status, is_local, is_verified, eco_certified,
        submitted_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', 1, 0, 0, datetime('now'), datetime('now'))`,
      [
        businessId,
        destination_id,
        owner_id,
        name,
        category,
        description,
        price_per_unit,
        contact_phone,
        contact_email,
        address,
        amenitiesJson,
        operating_hours,
      ]
    );

    const created: any = queryOne(`SELECT * FROM businesses WHERE id = ?`, [businessId]);
    return NextResponse.json({
      success: true,
      business: {
        ...created,
        is_local: true,
        is_verified: false,
        eco_certified: false,
        amenities,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to register business' },
      { status: 500 }
    );
  }
}
