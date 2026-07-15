import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// POST /api/auth/register
export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, error: 'All fields are required.' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ success: false, error: 'Password must be at least 8 characters.' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ success: false, error: 'An account with this email already exists.' }, { status: 409 });
    }

    // Generate unique default username
    const baseUsername = name.trim().toLowerCase().replace(/[^a-z0-9_]/g, '') || 'user';
    const randomSuffix = Math.random().toString(36).slice(2, 7);
    const username = `${baseUsername}_${randomSuffix}`;

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        username,
        password: hashed,
        role: 'USER',
        frameType: 'none',
        isVerified: false,
      },
      select: { id: true, name: true, email: true, username: true, role: true, createdAt: true },
    });

    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/auth/register]', error);
    return NextResponse.json({ success: false, error: 'Registration failed.' }, { status: 500 });
  }
}
