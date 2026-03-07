import { NextRequest, NextResponse } from 'next/server';
import { getDb, generateId } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('category_id');
    const search = searchParams.get('search');
    const type = searchParams.get('type');
    const all = searchParams.get('all');

    // If all=1, check admin auth and return all products (including inactive)
    let activeFilter = 'WHERE p.is_active = 1';
    if (all === '1') {
      const session = await getSessionUser();
      if (session?.isAdmin) {
        activeFilter = 'WHERE 1=1';
      }
    }

    let query = `
      SELECT p.*, c.name as category_name, c.type as category_type
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${activeFilter}
    `;
    const params: string[] = [];

    if (categoryId) {
      query += ' AND p.category_id = ?';
      params.push(categoryId);
    }

    if (search) {
      query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    if (type) {
      query += ' AND c.type = ?';
      params.push(type);
    }

    query += ' ORDER BY p.name ASC';

    const products = db.prepare(query).all(...params);

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
    const {
      category_id,
      name,
      description,
      price,
      image_url,
      sku,
      stock_quantity,
      requires_prescription,
      is_age_restricted,
      unit,
    } = body;

    if (!category_id || !name || price === undefined) {
      return NextResponse.json(
        { error: 'Category, name, and price are required' },
        { status: 400 }
      );
    }

    if (typeof price !== 'number' || price < 0) {
      return NextResponse.json(
        { error: 'Price must be a non-negative number' },
        { status: 400 }
      );
    }

    const db = getDb();

    // Verify category exists
    const category = db.prepare('SELECT id FROM categories WHERE id = ?').get(category_id);
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 400 }
      );
    }

    const id = generateId();
    db.prepare(
      `INSERT INTO products (id, category_id, name, description, price, image_url, sku, stock_quantity, requires_prescription, is_age_restricted, unit)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id,
      category_id,
      name.trim(),
      description?.trim() || '',
      price,
      image_url?.trim() || '',
      sku?.trim() || '',
      stock_quantity || 0,
      requires_prescription ? 1 : 0,
      is_age_restricted ? 1 : 0,
      unit?.trim() || 'piece'
    );

    const product = db.prepare(
      `SELECT p.*, c.name as category_name, c.type as category_type
       FROM products p LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = ?`
    ).get(id);

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
