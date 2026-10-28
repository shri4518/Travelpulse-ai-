import { NextResponse } from 'next/server';
import { query, queryOne, execute } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('business_id');

    if (!businessId) {
      return NextResponse.json({ success: false, error: 'business_id is required' }, { status: 400 });
    }

    const inquiries = query(
      `SELECT * FROM business_inquiries WHERE business_id = ? ORDER BY inquiry_date DESC`,
      [businessId]
    );

    return NextResponse.json({ success: true, inquiries });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch inquiries' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, notes } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: 'Inquiry ID and status are required' },
        { status: 400 }
      );
    }

    const validStatuses = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    execute(
      `UPDATE business_inquiries SET
        status = ?,
        notes = COALESCE(?, notes)
      WHERE id = ?`,
      [status, notes || null, id]
    );

    const updated = queryOne(`SELECT * FROM business_inquiries WHERE id = ?`, [id]);
    return NextResponse.json({ success: true, inquiry: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update inquiry' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { business_id, customer_name, customer_email, inquiry_date, guests = 1, notes = '' } = body;

    if (!business_id || !customer_name || !customer_email || !inquiry_date) {
      return NextResponse.json(
        { success: false, error: 'Missing required inquiry fields' },
        { status: 400 }
      );
    }

    const inquiryId = `inq-${Date.now()}`;
    execute(
      `INSERT INTO business_inquiries (
        id, business_id, customer_name, customer_email, inquiry_date, guests, status, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'PENDING', ?, datetime('now'))`,
      [inquiryId, business_id, customer_name, customer_email, inquiry_date, Number(guests) || 1, notes]
    );

    const created = queryOne(`SELECT * FROM business_inquiries WHERE id = ?`, [inquiryId]);
    return NextResponse.json({ success: true, inquiry: created });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit inquiry' },
      { status: 500 }
    );
  }
}
