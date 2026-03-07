import { NextRequest, NextResponse } from 'next/server';
import { getDb, generateId, generateOrderNumber } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const db = getDb();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query: string;
    const params: string[] = [];

    if (session.isAdmin) {
      query = 'SELECT * FROM orders WHERE 1=1';
    } else {
      query = 'SELECT * FROM orders WHERE user_id = ?';
      params.push(session.userId);
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const orders = db.prepare(query).all(...params);

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser();
    // Guest checkout allowed — session is optional

    const body = await request.json();
    const {
      items,
      delivery_address,
      delivery_city,
      customer_name,
      customer_phone,
      customer_email,
      payment_method,
      notes,
    } = body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'At least one item is required' },
        { status: 400 }
      );
    }
    if (!delivery_address) {
      return NextResponse.json(
        { error: 'Delivery address is required' },
        { status: 400 }
      );
    }
    if (!customer_name) {
      return NextResponse.json(
        { error: 'Customer name is required' },
        { status: 400 }
      );
    }
    if (!customer_phone) {
      return NextResponse.json(
        { error: 'Customer phone is required' },
        { status: 400 }
      );
    }

    const db = getDb();

    // Get delivery fee from settings
    const settings = db.prepare('SELECT delivery_fee, min_order_amount FROM app_settings WHERE id = 1').get() as {
      delivery_fee: number;
      min_order_amount: number;
    } | undefined;
    const deliveryFee = settings?.delivery_fee ?? 200;
    const minOrderAmount = settings?.min_order_amount ?? 0;

    // Validate each item and calculate totals
    let subtotal = 0;
    const validatedItems: {
      product_id: string;
      product_name: string;
      product_price: number;
      quantity: number;
      line_total: number;
    }[] = [];

    for (const item of items) {
      if (!item.product_id || !item.quantity || item.quantity < 1) {
        return NextResponse.json(
          { error: 'Each item must have a product_id and a quantity >= 1' },
          { status: 400 }
        );
      }

      const product = db.prepare(
        'SELECT id, name, price, stock_quantity, is_active FROM products WHERE id = ?'
      ).get(item.product_id) as {
        id: string;
        name: string;
        price: number;
        stock_quantity: number;
        is_active: number;
      } | undefined;

      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${item.product_id}` },
          { status: 400 }
        );
      }
      if (!product.is_active) {
        return NextResponse.json(
          { error: `Product is not available: ${product.name}` },
          { status: 400 }
        );
      }
      if (product.stock_quantity < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}. Available: ${product.stock_quantity}` },
          { status: 400 }
        );
      }

      const lineTotal = product.price * item.quantity;
      subtotal += lineTotal;

      validatedItems.push({
        product_id: product.id,
        product_name: product.name,
        product_price: product.price,
        quantity: item.quantity,
        line_total: lineTotal,
      });
    }

    if (minOrderAmount > 0 && subtotal < minOrderAmount) {
      return NextResponse.json(
        { error: `Minimum order amount is LKR ${minOrderAmount.toFixed(2)}` },
        { status: 400 }
      );
    }

    const total = subtotal + deliveryFee;

    // Use a transaction to insert order + items + update stock
    const orderId = generateId();
    const orderNumber = generateOrderNumber(db);

    const insertOrder = db.prepare(
      `INSERT INTO orders (id, user_id, order_number, status, subtotal, delivery_fee, total, payment_method, delivery_address, delivery_city, customer_name, customer_phone, customer_email, notes)
       VALUES (?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );

    const insertItem = db.prepare(
      `INSERT INTO order_items (id, order_id, product_id, product_name, product_price, quantity, line_total)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    );

    const updateStock = db.prepare(
      'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?'
    );

    const transaction = db.transaction(() => {
      insertOrder.run(
        orderId,
        session?.userId || null,
        orderNumber,
        subtotal,
        deliveryFee,
        total,
        payment_method || 'cod',
        delivery_address.trim(),
        delivery_city?.trim() || '',
        customer_name.trim(),
        customer_phone.trim(),
        customer_email?.trim() || '',
        notes?.trim() || ''
      );

      for (const item of validatedItems) {
        insertItem.run(
          generateId(),
          orderId,
          item.product_id,
          item.product_name,
          item.product_price,
          item.quantity,
          item.line_total
        );
        updateStock.run(item.quantity, item.product_id);
      }
    });

    transaction();

    // Return the created order with items
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    const orderItems = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId);

    return NextResponse.json({ order, items: orderItems }, { status: 201 });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
