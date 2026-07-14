import { getServerSession } from 'next-auth';
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
      include: { _count: { select: { comments: true } } },
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

// DELETE /api/posts/[id] — admin only
export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'Forbidden.' }, { status: 403 });
  }

  try {
    await prisma.post.delete({ where: { id } });
    return NextResponse.json({ success: true, data: { id } });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to delete post.' }, { status: 500 });
  }
}
