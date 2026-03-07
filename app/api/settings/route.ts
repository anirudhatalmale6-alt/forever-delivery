import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  try {
    const db = getDb();

    const settings = db.prepare('SELECT * FROM app_settings WHERE id = 1').get();

    if (!settings) {
      return NextResponse.json(
        { error: 'Settings not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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

    const body = await request.json();
    const { store_name, delivery_fee, min_order_amount, store_phone, store_address, is_store_open } = body;

    const db = getDb();

    const updates: string[] = [];
    const values: (string | number)[] = [];

    if (store_name !== undefined) {
      updates.push('store_name = ?');
      values.push(store_name.trim());
    }
    if (delivery_fee !== undefined) {
      if (typeof delivery_fee !== 'number' || delivery_fee < 0) {
        return NextResponse.json(
          { error: 'Delivery fee must be a non-negative number' },
          { status: 400 }
        );
      }
      updates.push('delivery_fee = ?');
      values.push(delivery_fee);
    }
    if (min_order_amount !== undefined) {
      if (typeof min_order_amount !== 'number' || min_order_amount < 0) {
        return NextResponse.json(
          { error: 'Minimum order amount must be a non-negative number' },
          { status: 400 }
        );
      }
      updates.push('min_order_amount = ?');
      values.push(min_order_amount);
    }
    if (store_phone !== undefined) {
      updates.push('store_phone = ?');
      values.push(store_phone.trim());
    }
    if (store_address !== undefined) {
      updates.push('store_address = ?');
      values.push(store_address.trim());
    }
    if (is_store_open !== undefined) {
      updates.push('is_store_open = ?');
      values.push(is_store_open ? 1 : 0);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    values.push(1); // WHERE id = 1
    db.prepare(`UPDATE app_settings SET ${updates.join(', ')} WHERE id = ?`).run(...values);

    const settings = db.prepare('SELECT * FROM app_settings WHERE id = 1').get();

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
