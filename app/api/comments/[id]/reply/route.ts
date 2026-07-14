import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { computeNewStatusLevel } from '@/lib/statusLevel';

type Params = { params: Promise<{ id: string }> };

// POST /api/comments/[id]/reply
export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Sign in to reply.' }, { status: 401 });
  }

  try {
    const { content } = await request.json();
    if (!content?.trim()) {
      return NextResponse.json({ success: false, error: 'Content is required.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 });
    if (user.isBanned) return NextResponse.json({ success: false, error: 'You are banned.' }, { status: 403 });
    if (user.timeoutUntil && user.timeoutUntil > new Date()) {
      return NextResponse.json({ success: false, error: 'You are in timeout.' }, { status: 403 });
    }

    const [reply] = await prisma.$transaction([
      prisma.reply.create({
        data: { commentId: id, userId: session.user.id, content: content.trim() },
        include: {
          user: { select: { id: true, name: true, statusLevel: true, role: true } },
        },
      }),
      prisma.user.update({
        where: { id: session.user.id },
        data: { statusLevel: computeNewStatusLevel(user.statusLevel) },
      }),
    ]);

    return NextResponse.json({ success: true, data: reply }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/comments/[id]/reply]', error);
    return NextResponse.json({ success: false, error: 'Failed to post reply.' }, { status: 500 });
  }
}
