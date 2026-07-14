import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/posts — public, paginated
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { comments: true } } },
      }),
      prisma.post.count(),
    ]);

    return NextResponse.json({ success: true, data: posts, total, page, limit });
  } catch (error) {
    console.error('[GET /api/posts]', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch posts.' }, { status: 500 });
  }
}

// POST /api/posts — admin only
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'Forbidden.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { imageUrl, caption } = body;

    if (!imageUrl) {
      return NextResponse.json({ success: false, error: 'imageUrl is required.' }, { status: 400 });
    }

    const post = await prisma.post.create({
      data: { imageUrl, caption: caption || null },
    });

    return NextResponse.json({ success: true, data: post }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/posts]', error);
    return NextResponse.json({ success: false, error: 'Failed to create post.' }, { status: 500 });
  }
}
