import { NextResponse } from 'next/server';
import { query, queryOne, execute } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const search = searchParams.get('search') || '';

    let sql = `SELECT id, role, full_name, avatar_url, onboarding_complete, is_active, age_range, travel_group, budget_preference, travel_style, created_at, updated_at FROM profiles WHERE 1=1`;
    const params: any[] = [];

    if (role && role !== 'ALL') {
      sql += ` AND role = ?`;
      params.push(role);
    }

    if (search.trim()) {
      sql += ` AND (full_name LIKE ? OR id LIKE ?)`;
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    sql += ` ORDER BY created_at DESC`;

    const users = query(sql, params).map((u: any) => ({
      ...u,
      onboarding_complete: Boolean(u.onboarding_complete),
      is_active: u.is_active !== undefined ? Boolean(u.is_active) : true,
    }));

    return NextResponse.json({ success: true, users });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, is_active, role, admin_id } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    // Safety: prevent admin from suspending themselves
    if (admin_id && id === admin_id && is_active === false) {
      return NextResponse.json(
        { success: false, error: 'Safety Violation: Administrators cannot suspend their own account' },
        { status: 400 }
      );
    }

    const current: any = queryOne(`SELECT * FROM profiles WHERE id = ?`, [id]);
    if (!current) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const newActive = is_active !== undefined ? (is_active ? 1 : 0) : current.is_active;
    const newRole = role !== undefined ? role : current.role;

    execute(
      `UPDATE profiles SET is_active = ?, role = ?, updated_at = datetime('now') WHERE id = ?`,
      [newActive, newRole, id]
    );

    // Record audit log
    const auditId = `log-${Date.now()}`;
    execute(
      `INSERT INTO audit_logs (id, admin_id, admin_name, action, target_entity, target_id, details, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      [
        auditId,
        admin_id || 'admin',
        'Administrator',
        is_active !== undefined ? (is_active ? 'REACTIVATE_USER' : 'SUSPEND_USER') : 'UPDATE_ROLE',
        'profiles',
        id,
        `Status set to ${is_active ? 'ACTIVE' : 'SUSPENDED'}, Role: ${newRole}`,
      ]
    );

    const updated = queryOne(`SELECT id, role, full_name, onboarding_complete, is_active FROM profiles WHERE id = ?`, [id]);
    return NextResponse.json({
      success: true,
      user: {
        ...updated,
        onboarding_complete: Boolean(updated.onboarding_complete),
        is_active: Boolean(updated.is_active),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update user' },
      { status: 500 }
    );
  }
}
