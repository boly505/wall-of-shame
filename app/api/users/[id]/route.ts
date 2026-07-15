import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/users/[id] — get user profile details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Search by username or id
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { id },
          { username: id }
        ]
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        avatar: true,
        bio: true,
        isVerified: true,
        frameType: true,
        statusLevel: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH /api/users/[id] — update user profile (avatar, bio, name, username)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  // Users can only edit their own profile, unless they are admin
  if (session.user.id !== id && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { name, username, bio, avatar } = body;

    // Validate username if provided
    if (username) {
      const sanitizedUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
      if (sanitizedUsername.length < 3) {
        return NextResponse.json({ error: 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل (أحرف إنجليزية وأرقام وعلامة _ فقط)' }, { status: 400 });
      }

      // Check if username is already taken by someone else
      const existing = await prisma.user.findFirst({
        where: {
          username: sanitizedUsername,
          NOT: { id }
        }
      });

      if (existing) {
        return NextResponse.json({ error: 'اسم المستخدم هذا محجوز بالفعل' }, { status: 400 });
      }

      body.username = sanitizedUsername;
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (username !== undefined) updateData.username = body.username;
    if (bio !== undefined) updateData.bio = bio.trim();
    if (avatar !== undefined) updateData.avatar = avatar;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        username: true,
        avatar: true,
        bio: true,
        isVerified: true,
        frameType: true,
      }
    });

    return NextResponse.json(updatedUser);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
