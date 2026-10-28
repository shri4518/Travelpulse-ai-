import { NextResponse } from 'next/server';
import { query, queryOne, execute } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('business_id');

    if (!businessId) {
      return NextResponse.json({ success: false, error: 'business_id is required' }, { status: 400 });
    }

    const listings = query(`SELECT * FROM listings WHERE business_id = ? ORDER BY created_at DESC`, [businessId]);
    return NextResponse.json({ success: true, listings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch listings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { business_id, title, category, price = 0, description = '', status = 'DRAFT' } = body;

    if (!business_id || !title || !category) {
      return NextResponse.json(
        { success: false, error: 'business_id, title, and category are required' },
        { status: 400 }
      );
    }

    const listingId = `list-${Date.now()}`;
    execute(
      `INSERT INTO listings (
        id, business_id, title, category, price, description, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [listingId, business_id, title, category, price, description, status]
    );

    const created = queryOne(`SELECT * FROM listings WHERE id = ?`, [listingId]);
    return NextResponse.json({ success: true, listing: created });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to create listing' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, title, category, price, description, status } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Listing ID is required' }, { status: 400 });
    }

    const existing: any = queryOne(`SELECT * FROM listings WHERE id = ?`, [id]);
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Listing not found' }, { status: 404 });
    }

    const merged = {
      title: title !== undefined ? title : existing.title,
      category: category !== undefined ? category : existing.category,
      price: price !== undefined ? Number(price) : existing.price,
      description: description !== undefined ? description : existing.description,
      status: status !== undefined ? status : existing.status,
    };

    execute(
      `UPDATE listings SET
        title = ?,
        category = ?,
        price = ?,
        description = ?,
        status = ?,
        updated_at = datetime('now')
      WHERE id = ?`,
      [merged.title, merged.category, merged.price, merged.description, merged.status, id]
    );

    const updated = queryOne(`SELECT * FROM listings WHERE id = ?`, [id]);
    return NextResponse.json({ success: true, listing: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to update listing' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Listing ID is required' }, { status: 400 });
    }

    execute(`DELETE FROM listings WHERE id = ?`, [id]);
    return NextResponse.json({ success: true, deletedId: id });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to delete listing' }, { status: 500 });
  }
}
