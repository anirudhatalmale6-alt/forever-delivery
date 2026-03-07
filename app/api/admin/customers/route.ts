import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    if (!session.isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const db = getDb();

    const customers = db.prepare(`
      SELECT
        u.id,
        u.email,
        u.full_name,
        u.phone,
        u.address,
        u.city,
        u.created_at,
        (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id) as order_count
      FROM users u
      WHERE u.is_admin = 0
      ORDER BY u.created_at DESC
    `).all();

    return NextResponse.json({ customers });
  } catch (error) {
    console.error('Get customers error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
