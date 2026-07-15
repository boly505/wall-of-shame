import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type Params = { params: Promise<{ id: string }> };

// GET /api/posts/[id]
export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, username: true, avatar: true, isVerified: true, frameType: true, role: true } },
        _count: { select: { comments: true, likes: true } },
      },
    });
    if (!post) return NextResponse.json({ success: false, error: 'Post not found.' }, { status: 404 });
    return NextResponse.json({ success: true, data: post });
  } catch {
    return NextResponse.json({ success: false, error: 'Server error.' }, { status: 500 });
  }
}

// PATCH /api/posts/[id] — admin only
export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'Forbidden.' }, { status: 403 });
  }

  try {
    const { caption } = await request.json();
    const post = await prisma.post.update({
      where: { id },
      data: { caption },
    });
    return NextResponse.json({ success: true, data: post });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to update post.' }, { status: 500 });
  }
}

// DELETE /api/posts/[id] — admin or post owner
export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const post = await prisma.post.findUnique({ where: { id }, select: { authorId: true } });
    if (!post) return NextResponse.json({ success: false, error: 'Not found.' }, { status: 404 });

    const isAdmin = session.user.role === 'ADMIN';
    const isOwner = post.authorId === session.user.id;
    if (!isAdmin && !isOwner) {
      return NextResponse.json({ success: false, error: 'Forbidden.' }, { status: 403 });
    }

    await prisma.post.delete({ where: { id } });
    return NextResponse.json({ success: true, data: { id } });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to delete post.' }, { status: 500 });
  }
}
