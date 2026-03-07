import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDb, generateId } from '@/lib/db';
import { signToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, full_name, phone } = body;

    if (!email || !password || !full_name) {
      return NextResponse.json(
        { error: 'Email, password, and full name are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const db = getDb();
    const normalizedEmail = email.toLowerCase().trim();

    // Check if email already exists
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail);
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      );
    }

    const id = generateId();
    const passwordHash = bcrypt.hashSync(password, 10);

    db.prepare(
      `INSERT INTO users (id, email, password_hash, full_name, phone, is_admin) VALUES (?, ?, ?, ?, ?, 0)`
    ).run(id, normalizedEmail, passwordHash, full_name.trim(), phone?.trim() || '');

    const token = signToken({
      userId: id,
      email: normalizedEmail,
      isAdmin: false,
    });

    const response = NextResponse.json({
      user: {
        id,
        email: normalizedEmail,
        full_name: full_name.trim(),
        phone: phone?.trim() || '',
        address: '',
        city: '',
        is_admin: false,
      },
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
