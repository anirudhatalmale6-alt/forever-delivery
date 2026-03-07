import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const db = getDb();

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as {
      id: string;
      user_id: string;
      order_number: string;
      status: string;
      subtotal: number;
      delivery_fee: number;
      total: number;
      payment_method: string;
      delivery_address: string;
      delivery_city: string;
      customer_name: string;
      customer_phone: string;
      customer_email: string;
      notes: string;
      created_at: string;
      updated_at: string;
    } | undefined;

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Regular users can only see their own orders
    if (!session.isAdmin && order.user_id !== session.userId) {
      return NextResponse.json(
        { error: 'Not authorized to view this order' },
        { status: 403 }
      );
    }

    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(id);

    return NextResponse.json({ order, items });
  } catch (error) {
    console.error('Get order error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const db = getDb();

    const existing = db.prepare('SELECT id, status FROM orders WHERE id = ?').get(id) as {
      id: string;
      status: string;
    } | undefined;

    if (!existing) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    const validStatuses = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    db.prepare(
      `UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?`
    ).run(status, id);

    // If cancelling, restore stock
    if (status === 'cancelled' && existing.status !== 'cancelled') {
      const items = db.prepare('SELECT product_id, quantity FROM order_items WHERE order_id = ?').all(id) as {
        product_id: string | null;
        quantity: number;
      }[];

      const restoreStock = db.prepare(
        'UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?'
      );
      for (const item of items) {
        if (item.product_id) {
          restoreStock.run(item.quantity, item.product_id);
        }
      }
    }

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(id);

    return NextResponse.json({ order, items });
  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
