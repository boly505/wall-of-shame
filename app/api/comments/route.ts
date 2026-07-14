import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { computeNewStatusLevel } from '@/lib/statusLevel';

// GET /api/comments?postId=xxx
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const postId = searchParams.get('postId');

  if (!postId) {
    return NextResponse.json({ success: false, error: 'postId is required.' }, { status: 400 });
  }

  try {
    const comments = await prisma.comment.findMany({
      where: { postId },
      orderBy: { timestamp: 'asc' },
      include: {
        user: { select: { id: true, name: true, statusLevel: true, role: true } },
        replies: {
          orderBy: { timestamp: 'asc' },
          include: {
            user: { select: { id: true, name: true, statusLevel: true, role: true } },
          },
        },
        likes: { select: { userId: true } },
        _count: { select: { likes: true } },
      },
    });

    return NextResponse.json({ success: true, data: comments });
  } catch (error) {
    console.error('[GET /api/comments]', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch comments.' }, { status: 500 });
  }
}

// POST /api/comments — authenticated users
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ success: false, error: 'You must be signed in to comment.' }, { status: 401 });
  }

  try {
    const { postId, content } = await request.json();

    if (!postId || !content?.trim()) {
      return NextResponse.json({ success: false, error: 'postId and content are required.' }, { status: 400 });
    }

    // Check user status
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 });
    if (user.isBanned) return NextResponse.json({ success: false, error: 'You are banned.' }, { status: 403 });
    if (user.timeoutUntil && user.timeoutUntil > new Date()) {
      return NextResponse.json({ success: false, error: 'You are in timeout.' }, { status: 403 });
    }

    // Create comment + increment statusLevel
    const [comment] = await prisma.$transaction([
      prisma.comment.create({
        data: { postId, userId: session.user.id, content: content.trim() },
        include: {
          user: { select: { id: true, name: true, statusLevel: true, role: true } },
          replies: { include: { user: { select: { id: true, name: true, statusLevel: true, role: true } } } },
          likes: { select: { userId: true } },
          _count: { select: { likes: true } },
        },
      }),
      prisma.user.update({
        where: { id: session.user.id },
        data: { statusLevel: computeNewStatusLevel(user.statusLevel) },
      }),
    ]);

    return NextResponse.json({ success: true, data: comment }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/comments]', error);
    return NextResponse.json({ success: false, error: 'Failed to post comment.' }, { status: 500 });
  }
}
