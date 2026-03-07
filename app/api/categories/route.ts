import { NextRequest, NextResponse } from 'next/server';
import { getDb, generateId } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    let query = `
      SELECT c.*,
        (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id AND p.is_active = 1) as product_count
      FROM categories c
      WHERE c.is_active = 1
    `;
    const params: string[] = [];

    if (type) {
      query += ' AND c.type = ?';
      params.push(type);
    }

    query += ' ORDER BY c.sort_order ASC, c.name ASC';

    const categories = db.prepare(query).all(...params);

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
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
    const { name, slug, description, type, sort_order } = body;

    if (!name || !slug || !type) {
      return NextResponse.json(
        { error: 'Name, slug, and type are required' },
        { status: 400 }
      );
    }

    if (!['pharmacy', 'liquor'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be "pharmacy" or "liquor"' },
        { status: 400 }
      );
    }

    const db = getDb();

    // Check slug uniqueness
    const existing = db.prepare('SELECT id FROM categories WHERE slug = ?').get(slug);
    if (existing) {
      return NextResponse.json(
        { error: 'A category with this slug already exists' },
        { status: 400 }
      );
    }

    const id = generateId();
    db.prepare(
      `INSERT INTO categories (id, name, slug, description, type, sort_order) VALUES (?, ?, ?, ?, ?, ?)`
    ).run(id, name.trim(), slug.trim(), description?.trim() || '', type, sort_order || 0);

    const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error('Create category error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
