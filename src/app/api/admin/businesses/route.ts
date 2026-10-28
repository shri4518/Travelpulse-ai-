import { NextResponse } from 'next/server';
import { query, queryOne, execute } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search') || '';

    let sql = `
      SELECT b.*, p.full_name as owner_name, p.role as owner_role
      FROM businesses b
      LEFT JOIN profiles p ON b.owner_id = p.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status && status !== 'ALL') {
      sql += ` AND b.status = ?`;
      params.push(status);
    }

    if (search.trim()) {
      sql += ` AND (b.name LIKE ? OR b.address LIKE ? OR p.full_name LIKE ?)`;
      params.push(`%${search.trim()}%`, `%${search.trim()}%`, `%${search.trim()}%`);
    }

    sql += ` ORDER BY b.created_at DESC`;

    const businesses = query(sql, params).map((b: any) => ({
      ...b,
      is_local: Boolean(b.is_local),
      is_verified: Boolean(b.is_verified),
      eco_certified: Boolean(b.eco_certified),
      amenities: typeof b.amenities === 'string' ? JSON.parse(b.amenities || '[]') : b.amenities,
    }));

    const counts = {
      total: query(`SELECT COUNT(*) as c FROM businesses`)[0]?.c || 0,
      pending: query(`SELECT COUNT(*) as c FROM businesses WHERE status = 'PENDING'`)[0]?.c || 0,
      approved: query(`SELECT COUNT(*) as c FROM businesses WHERE status = 'APPROVED'`)[0]?.c || 0,
      rejected: query(`SELECT COUNT(*) as c FROM businesses WHERE status = 'REJECTED'`)[0]?.c || 0,
    };

    return NextResponse.json({ success: true, businesses, counts });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch business queue' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, action, rejection_reason, admin_id, admin_name } = body;

    if (!id || !action) {
      return NextResponse.json(
        { success: false, error: 'Business ID and action are required' },
        { status: 400 }
      );
    }

    const current: any = queryOne(`SELECT * FROM businesses WHERE id = ?`, [id]);
    if (!current) {
      return NextResponse.json({ success: false, error: 'Business not found' }, { status: 404 });
    }

    let newStatus = current.status;
    let isVerified = current.is_verified;

    if (action === 'APPROVE') {
      newStatus = 'APPROVED';
      isVerified = 1;
    } else if (action === 'REJECT') {
      newStatus = 'REJECTED';
      isVerified = 0;
      if (!rejection_reason || !rejection_reason.trim()) {
        return NextResponse.json(
          { success: false, error: 'A clear rejection reason is required when rejecting a business' },
          { status: 400 }
        );
      }
    } else if (action === 'SUSPEND') {
      newStatus = 'SUSPENDED';
      isVerified = 0;
    }

    execute(
      `UPDATE businesses SET
        status = ?,
        is_verified = ?,
        rejection_reason = ?,
        reviewed_at = datetime('now'),
        reviewed_by = ?
      WHERE id = ?`,
      [newStatus, isVerified, rejection_reason || null, admin_id || 'admin', id]
    );

    // Record in audit logs
    const auditId = `log-${Date.now()}`;
    execute(
      `INSERT INTO audit_logs (id, admin_id, admin_name, action, target_entity, target_id, details, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      [
        auditId,
        admin_id || 'admin',
        admin_name || 'Administrator',
        `${action}_BUSINESS`,
        'businesses',
        id,
        action === 'REJECT'
          ? `Rejected ${current.name}. Reason: ${rejection_reason}`
          : `Approved ${current.name} for official platform directory`,
      ]
    );

    const updated: any = queryOne(`SELECT * FROM businesses WHERE id = ?`, [id]);
    return NextResponse.json({
      success: true,
      business: {
        ...updated,
        is_verified: Boolean(updated.is_verified),
        amenities: JSON.parse(updated.amenities || '[]'),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update business status' },
      { status: 500 }
    );
  }
}
