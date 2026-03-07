import { NextRequest, NextResponse } from 'next/server';
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

    const db = getDb();
    const user = db.prepare(
      'SELECT id, email, full_name, phone, address, city, is_admin, created_at FROM users WHERE id = ?'
    ).get(session.userId) as {
      id: string;
      email: string;
      full_name: string;
      phone: string;
      address: string;
      city: string;
      is_admin: number;
      created_at: string;
    } | undefined;

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        address: user.address,
        city: user.city,
        is_admin: user.is_admin === 1,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
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

    const body = await request.json();
    const { full_name, phone, address, city } = body;

    const db = getDb();

    // Build dynamic update
    const updates: string[] = [];
    const values: (string)[] = [];

    if (full_name !== undefined) {
      updates.push('full_name = ?');
      values.push(full_name.trim());
    }
    if (phone !== undefined) {
      updates.push('phone = ?');
      values.push(phone.trim());
    }
    if (address !== undefined) {
      updates.push('address = ?');
      values.push(address.trim());
    }
    if (city !== undefined) {
      updates.push('city = ?');
      values.push(city.trim());
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    updates.push("updated_at = datetime('now')");
    values.push(session.userId);

    db.prepare(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`
    ).run(...values);

    // Return updated user
    const user = db.prepare(
      'SELECT id, email, full_name, phone, address, city, is_admin FROM users WHERE id = ?'
    ).get(session.userId) as {
      id: string;
      email: string;
      full_name: string;
      phone: string;
      address: string;
      city: string;
      is_admin: number;
    };

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        address: user.address,
        city: user.city,
        is_admin: user.is_admin === 1,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const response = NextResponse.json({ message: 'Logged out successfully' });

    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
