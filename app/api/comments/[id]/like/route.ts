import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type Params = { params: Promise<{ id: string }> };

// POST /api/comments/[id]/like — toggle like
export async function POST(_req: Request, { params }: Params) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Sign in to like.' }, { status: 401 });
  }

  try {
    const existing = await prisma.commentLike.findUnique({
      where: { commentId_userId: { commentId: id, userId: session.user.id } },
    });

    if (existing) {
      await prisma.commentLike.delete({ where: { id: existing.id } });
    } else {
      await prisma.commentLike.create({
        data: { commentId: id, userId: session.user.id },
      });
    }

    const count = await prisma.commentLike.count({ where: { commentId: id } });
    const liked = !existing;

    return NextResponse.json({ success: true, data: { count, liked } });
  } catch (error) {
    console.error('[POST /api/comments/[id]/like]', error);
    return NextResponse.json({ success: false, error: 'Failed to toggle like.' }, { status: 500 });
  }
}
